<?php

namespace App\Http\Controllers;

use App\Models\AcademicSupervisor;
use App\Models\AdminRecordChange;
use App\Models\EvaluationTemplate;
use App\Models\FinalInternshipReport;
use App\Models\EvaluationComponent;
use App\Models\Student;
use App\Services\InternshipCompletionStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinalInternshipReportController extends Controller
{
    public function student(): Response
    {
        $student = Student::where('user_id', auth()->id())->firstOrFail();
        return $this->render($student, 'student');
    }

    public function saveStudent(Request $request): RedirectResponse
    {
        $student = Student::where('user_id', auth()->id())->firstOrFail();
        $oldPdfPath = null;
        $newPdfPath = null;

        try {
            DB::transaction(function () use ($request, $student, &$oldPdfPath, &$newPdfPath) {
                $report = FinalInternshipReport::where('student_id', $student->student_id)
                    ->lockForUpdate()
                    ->first();

                if ($report?->academic_review_status === 'Approved' && !$report->reopened_at) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'submit' => 'Your report has been approved and is locked. Ask Superadmin to reopen it before making changes.',
                    ]);
                }

                $pdfRequired = empty($report?->pdf_path);
                $data = $request->validate([
                    'title' => ['required', 'string', 'max:255'],
                    'pdf' => [$pdfRequired ? 'required' : 'nullable', 'file', 'mimes:pdf', 'max:20480'],
                    'submit' => ['required', 'accepted'],
                ]);

                $report ??= new FinalInternshipReport(['student_id' => $student->student_id]);
                // The legacy schema requires a text body, while new submissions contain a PDF.
                $report->body ??= '';
                $wasSubmitted = (bool) $report->submitted_at;
                $oldPdfPath = $report->pdf_path;
                $report->title = $data['title'] ?? $report->title ?? 'Final Internship Report';
                if ($request->hasFile('pdf')) {
                    $newPdfPath = $request->file('pdf')->store('final-internship-reports', 'local');
                    $report->pdf_path = $newPdfPath;
                }
                if ($data['submit']) {
                    abort_unless($report->pdf_path, 422, 'Upload a PDF before submitting your report.');
                    $report->submitted_at = now();
                }
                if (($wasSubmitted && $newPdfPath) || $data['submit'] || $report->academic_review_status === 'Changes Required') {
                    $report->academic_review_status = 'Pending Review';
                    $report->report_score = null;
                    $report->report_component_weight_snapshot = null;
                    $report->academic_review_comments = null;
                    $report->academic_reviewed_at = null;
                    $report->report_template_id = null;
                    $report->report_template_version = null;
                    $report->report_template_snapshot = null;
                    $report->report_answers = null;
                    $report->reopened_at = null;
                    $report->reopened_by_user_id = null;
                }
                $report->save();
                $student->internshipCompletion?->resetAcademicDecision();
            });
        } catch (\Throwable $exception) {
            if ($newPdfPath) {
                Storage::disk('local')->delete($newPdfPath);
            }

            throw $exception;
        }

        if ($newPdfPath && $oldPdfPath && $oldPdfPath !== $newPdfPath) {
            Storage::disk('local')->delete($oldPdfPath);
        }

        return back()->with('success', 'Final internship report submitted for review.');
    }

    public function academic(Student $student): Response
    {
        $this->authorizeAcademic($student);
        return $this->render($student, 'academic');
    }

    public function admin(Student $student): Response
    {
        abort_unless(auth()->user()->role === 'Admin', 403);
        return $this->render($student, 'admin');
    }

    public function reviewAcademic(Request $request, Student $student): RedirectResponse
    {
        $this->authorizeAcademic($student);
        DB::transaction(function () use ($request, $student) {
            $report = FinalInternshipReport::where('student_id', $student->student_id)->lockForUpdate()->first();
            abort_unless($report?->submitted_at, 404, 'The student has not submitted a final report.');
            if ($report->academic_reviewed_at && !$report->reopened_at) {
                throw \Illuminate\Validation\ValidationException::withMessages(['answers' => 'This reviewed report is locked. Ask Superadmin to reopen it for correction.']);
            }
            $template = EvaluationTemplate::with('sections.criteria.ratingLevels')
                ->where('supervisor_type', 'Written Report')->when(
                    $report->reopened_at && $report->report_template_id,
                    fn ($query) => $query->whereKey($report->report_template_id),
                    fn ($query) => $query->where('is_active', true)
                )
                ->latest('version')
                ->firstOrFail();
            $data = $request->validate([
                'status' => ['required', 'in:Approved,Changes Required'],
                'answers' => ['required_if:status,Approved', 'array'],
                'comments' => ['nullable', 'string', 'max:5000'],
            ]);

            $answers = [];
            $score = null;
            $templateSnapshot = null;
            if ($data['status'] === 'Approved') {
                $expectedCriteria = $template->sections->flatMap(fn ($section) => $section->criteria)->keyBy('id');
                if (count($data['answers'] ?? []) !== $expectedCriteria->count()) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'answers' => 'Choose a grading level for every written report criterion.',
                    ]);
                }

                $score = 0.0;
                foreach ($template->sections as $section) {
                    $sectionEarnedPoints = 0;
                    $sectionMaximumPoints = 0;
                    foreach ($section->criteria as $criterion) {
                        $levelId = $data['answers'][$criterion->id] ?? null;
                        $level = $criterion->ratingLevels->firstWhere('id', (int) $levelId);
                        if (!$level) {
                            throw \Illuminate\Validation\ValidationException::withMessages([
                                "answers.{$criterion->id}" => 'Choose a valid grading level for this criterion.',
                            ]);
                        }

                        $maximum = (int) $criterion->ratingLevels->max('points');
                        $sectionEarnedPoints += (int) $level->points;
                        $sectionMaximumPoints += $maximum;
                        $answers[$criterion->id] = [
                            'section' => $section->title,
                            'section_weight' => (float) $section->weight,
                            'criterion' => $criterion->title,
                            'criterion_description' => $criterion->description,
                            'level_id' => $level->id,
                            'level' => $level->title,
                            'level_description' => $level->description,
                            'points' => (int) $level->points,
                        ];
                    }

                    if ($sectionMaximumPoints > 0) {
                        $score += ($sectionEarnedPoints / $sectionMaximumPoints) * (float) $section->weight;
                    }
                }

                $templateSnapshot = $template->only(['id', 'name', 'supervisor_type', 'version']);
                $templateSnapshot['sections'] = $template->sections->map(fn ($section) => [
                    'title' => $section->title,
                    'description' => $section->description,
                    'weight' => (float) $section->weight,
                    'criteria' => $section->criteria->map(fn ($criterion) => [
                        'id' => $criterion->id,
                        'title' => $criterion->title,
                        'description' => $criterion->description,
                        'levels' => $criterion->ratingLevels->map(fn ($level) => $level->only(['title', 'description', 'points'])),
                    ]),
                ]);
            }

            $component = EvaluationComponent::where('component_key', 'student_written_report')->firstOrFail();
            $report->update([
                'academic_review_status' => $data['status'],
                'report_score' => $score === null ? null : round($score, 2),
                'report_component_weight_snapshot' => $data['status'] === 'Approved'
                    ? ($report->reopened_at && $report->report_component_weight_snapshot !== null ? $report->report_component_weight_snapshot : $component->active_weight)
                    : null,
                'report_template_id' => $data['status'] === 'Approved' ? $template->id : null,
                'report_template_version' => $data['status'] === 'Approved' ? $template->version : null,
                'report_template_snapshot' => $templateSnapshot,
                'report_answers' => $data['status'] === 'Approved' ? $answers : null,
                'academic_review_comments' => $data['comments'] ?? null,
                'academic_reviewed_at' => now(),
                'reopened_at' => null,
                'reopened_by_user_id' => null,
            ]);
            $student->internshipCompletion?->resetAcademicDecision();
        });
        return back()->with('success', 'Academic report review saved.');
    }

    public function download(Student $student)
    {
        abort_unless(in_array(auth()->user()->role, ['Academic Supervisor', 'Admin'], true), 403);
        if (auth()->user()->role !== 'Admin') {
            $this->authorizeAcademic($student);
        }

        $report = $student->finalInternshipReport;
        abort_unless($report?->submitted_at && $report->pdf_path, 404);
        abort_unless(Storage::disk('local')->exists($report->pdf_path), 404);

        return Storage::disk('local')->download($report->pdf_path, ($report->title ?: 'Final internship report') . '.pdf');
    }

    private function render(Student $student, string $viewer): Response
    {
        $report = $student->finalInternshipReport;
        $reportData = $report?->toArray();
        if ($reportData) {
            unset(
                $reportData['pdf_path'],
                $reportData['industry_confirmation_status'],
                $reportData['industry_confirmation_comments'],
                $reportData['industry_confirmed_at']
            );
            if ($viewer === 'student') {
                unset($reportData['report_template_id'], $reportData['report_template_version'], $reportData['report_template_snapshot'], $reportData['report_answers']);
            }
        }

        $reportRubric = $viewer === 'academic'
            ? EvaluationTemplate::with('sections.criteria.ratingLevels')
                ->where('supervisor_type', 'Written Report')->when(
                    $report?->report_template_id,
                    fn ($query) => $query->whereKey($report->report_template_id),
                    fn ($query) => $query->where('is_active', true)
                )->latest('version')->first()
            : null;

        return Inertia::render('FinalInternshipReport', [
            'student' => $student->only(['student_id', 'pb_student_code', 'full_name']),
            'report' => $reportData,
            'completionRecord' => $student->internshipCompletion?->only([
                'industry_confirmation_status',
                'industry_confirmed_at',
                'academic_completion_status',
                'academic_completion_decided_at',
            ]),
            'viewer' => $viewer,
            'reviewLocked' => (bool) ($report?->academic_reviewed_at && !$report?->reopened_at),
            'reviewHistory' => $viewer === 'admin' && $report
                ? AdminRecordChange::where('subject_type', $report->getMorphClass())->where('subject_id', $report->getKey())
                    ->where('action', 'Reopened written report')->oldest()->get(['id', 'before_snapshot', 'created_at'])
                : [],
            'reportRubric' => $reportRubric,
            'completionStatus' => app(InternshipCompletionStatus::class)->for($student, $report),
            'overallScore' => app(InternshipCompletionStatus::class)->overallScore($student),
            'reportDownloadUrl' => in_array($viewer, ['academic', 'admin'], true) && $report?->submitted_at && $report->pdf_path
                ? route($viewer === 'admin' ? 'admin.students.report.pdf' : 'academic-supervisor.student.final-report.download', $student->student_id)
                : null,
            'studentWrittenReportWeight' => EvaluationComponent::where('component_key', 'student_written_report')->value('active_weight') ?? 0,
        ]);
    }

    private function authorizeAcademic(Student $student): void
    {
        $supervisor = AcademicSupervisor::where('user_id', auth()->id())->firstOrFail();
        $student->academicSupervisorAssignments()
            ->where('academic_supervisor_id', $supervisor->academic_supervisor_id)->firstOrFail();
    }

}
