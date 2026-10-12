<?php

namespace App\Http\Controllers;

use App\Models\AcademicSupervisor;
use App\Models\EvaluationSubmission;
use App\Models\EvaluationTemplate;
use App\Models\IndustrySupervisor;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SupervisorEvaluationController extends Controller
{
    public function createAcademic(Student $student): Response
    {
        $supervisor = AcademicSupervisor::where('user_id', auth()->id())->firstOrFail();
        $this->authorizeAcademic($supervisor, $student);
        return $this->form($student, $supervisor, 'Academic Supervisor');
    }

    public function storeAcademic(Request $request, Student $student): RedirectResponse
    {
        $supervisor = AcademicSupervisor::where('user_id', auth()->id())->firstOrFail();
        $this->authorizeAcademic($supervisor, $student);
        return $this->submit($request, $student, $supervisor, 'Academic Supervisor');
    }

    public function createIndustry(Student $student): Response
    {
        $supervisor = IndustrySupervisor::where('user_id', auth()->id())->firstOrFail();
        abort_unless($supervisor->applications()->where('student_id', $student->student_id)->where('app_status', 'Recruited')->exists(), 403);
        return $this->form($student, $supervisor, 'Industry Supervisor');
    }

    public function storeIndustry(Request $request, Student $student): RedirectResponse
    {
        $supervisor = IndustrySupervisor::where('user_id', auth()->id())->firstOrFail();
        abort_unless($supervisor->applications()->where('student_id', $student->student_id)->where('app_status', 'Recruited')->exists(), 403);
        return $this->submit($request, $student, $supervisor, 'Industry Supervisor');
    }

    public function showAcademicSubmission(Student $student, EvaluationSubmission $submission): Response
    {
        $supervisor = AcademicSupervisor::where('user_id', auth()->id())->firstOrFail();
        $this->authorizeAcademic($supervisor, $student);

        abort_unless((int) $submission->student_id === (int) $student->student_id, 404);
        abort_unless(in_array($submission->supervisor_type, ['Academic Supervisor', 'Industry Supervisor'], true), 404);
        if ($submission->supervisor_type === 'Academic Supervisor') {
            abort_unless((int) $submission->academic_supervisor_id === (int) $supervisor->academic_supervisor_id, 404);
        }

        return $this->evaluationResult($student, $submission, 'academic');
    }

    public function showIndustrySubmission(Student $student, EvaluationSubmission $submission): Response
    {
        $supervisor = IndustrySupervisor::where('user_id', auth()->id())->firstOrFail();
        abort_unless($supervisor->applications()->where('student_id', $student->student_id)->where('app_status', 'Recruited')->exists(), 403);
        abort_unless(
            (int) $submission->student_id === (int) $student->student_id
                && $submission->supervisor_type === 'Industry Supervisor'
                && (int) $submission->industry_supervisor_id === (int) $supervisor->supervisor_id,
            404
        );

        return $this->evaluationResult($student, $submission, 'industry');
    }

    private function evaluationResult(Student $student, EvaluationSubmission $submission, string $viewer): Response
    {
        return Inertia::render('Supervisor/EvaluationResult', [
            'student' => $student->only(['student_id', 'pb_student_code', 'full_name']),
            'submission' => $submission,
            'viewer' => $viewer,
        ]);
    }

    private function form(Student $student, AcademicSupervisor|IndustrySupervisor $supervisor, string $type): Response
    {
        [$template, $submission] = $this->selection($student, $supervisor, $type);
        if ($submission && !$submission->reopened_at) {
            return $this->evaluationResult($student, $submission, $type === 'Academic Supervisor' ? 'academic' : 'industry');
        }
        if ($submission) {
            $template->component_weight = data_get($submission->template_snapshot, 'component_weight', $template->component_weight);
        }

        return Inertia::render('Supervisor/Evaluation', [
            'student' => $student->only(['student_id', 'pb_student_code', 'full_name']),
            'template' => $template,
            'submission' => $submission,
            'supervisorType' => $type,
        ]);
    }

    private function submit(Request $request, Student $student, AcademicSupervisor|IndustrySupervisor $supervisor, string $type): RedirectResponse
    {
        [$template, $existingSubmission] = $this->selection($student, $supervisor, $type);
        if ($existingSubmission && !$existingSubmission->reopened_at) {
            throw ValidationException::withMessages(['answers' => 'This submitted evaluation is locked. Ask Superadmin to reopen it for correction.']);
        }
        $validated = $request->validate(['answers' => ['required', 'array'], 'comments' => ['nullable', 'string', 'max:5000']]);

        $expected = $template->sections->flatMap(fn ($section) => $section->criteria)->keyBy('id');
        if (count($validated['answers']) !== $expected->count()) {
            throw ValidationException::withMessages(['answers' => 'Select one grading level for every criterion.']);
        }

        $answerSnapshots = [];
        $score = 0.0;
        foreach ($template->sections as $section) {
            $criteria = $section->criteria;
            $sectionWeight = (float) $section->weight;
            $sectionEarnedPoints = 0;
            $sectionMaximumPoints = 0;
            foreach ($criteria as $criterion) {
                $levelId = $validated['answers'][$criterion->id] ?? null;
                $level = $criterion->ratingLevels->firstWhere('id', (int) $levelId);
                if (!$level) {
                    throw ValidationException::withMessages(["answers.{$criterion->id}" => 'Choose a valid level for this criterion.']);
                }
                $maximum = (int) $criterion->ratingLevels->max('points');
                $sectionEarnedPoints += (int) $level->points;
                $sectionMaximumPoints += $maximum;
                $answerSnapshots[$criterion->id] = [
                    'level_id' => $level->id,
                    'section' => $section->title, 'section_weight' => $sectionWeight,
                    'criterion' => $criterion->title, 'criterion_description' => $criterion->description,
                    'level' => $level->title, 'level_description' => $level->description,
                    'points' => (int) $level->points,
                ];
            }

            if ($sectionMaximumPoints > 0) {
                $score += ($sectionEarnedPoints / $sectionMaximumPoints) * $sectionWeight;
            }
        }

        $templateSnapshot = $template->only(['id', 'name', 'supervisor_type', 'component_weight', 'version']);
        $templateSnapshot['sections'] = $template->sections->map(fn ($section) => [
            'title' => $section->title, 'description' => $section->description,
            'weight' => (float) $section->weight,
            'criteria' => $section->criteria->map(fn ($criterion) => [
                'id' => $criterion->id, 'title' => $criterion->title, 'description' => $criterion->description,
                'levels' => $criterion->ratingLevels->map(fn ($level) => $level->only(['title', 'description', 'points'])),
            ]),
        ]);
        if ($existingSubmission?->reopened_at) {
            $templateSnapshot = $existingSubmission->template_snapshot;
        }

        $ownerField = $type === 'Academic Supervisor' ? 'academic_supervisor_id' : 'industry_supervisor_id';
        $ownerId = $type === 'Academic Supervisor' ? $supervisor->academic_supervisor_id : $supervisor->supervisor_id;
        $query = EvaluationSubmission::where('evaluation_template_id', $template->id)
            ->where('student_id', $student->student_id)->where($ownerField, $ownerId);
        DB::transaction(function () use ($query, $template, $student, $type, $ownerField, $ownerId, $templateSnapshot, $answerSnapshots, $score, $validated) {
            Student::whereKey($student->getKey())->lockForUpdate()->firstOrFail();
            $submission = $query->lockForUpdate()->first() ?? new EvaluationSubmission();
            if ($submission->exists && !$submission->reopened_at) {
                throw ValidationException::withMessages(['answers' => 'This evaluation is already submitted and locked.']);
            }
            $submission->fill([
                'evaluation_template_id' => $template->id, 'template_version' => $template->version,
                'student_id' => $student->student_id, 'supervisor_type' => $type,
                'academic_supervisor_id' => $ownerField === 'academic_supervisor_id' ? $ownerId : null,
                'industry_supervisor_id' => $ownerField === 'industry_supervisor_id' ? $ownerId : null,
                'template_snapshot' => $templateSnapshot, 'answers' => $answerSnapshots,
                'overall_score' => round($score, 2), 'comments' => $validated['comments'] ?? null, 'submitted_at' => now(),
                'reopened_at' => null, 'reopened_by_user_id' => null,
            ])->save();
        });
        $student->internshipCompletion?->resetAcademicDecision();

        return redirect()->route(
            $type === 'Academic Supervisor' ? 'academic-supervisor.student.show' : 'industry-supervisor.student.show',
            $student->student_id
        )->with('success', 'Evaluation submitted successfully.');
    }

    private function authorizeAcademic(AcademicSupervisor $supervisor, Student $student): void
    {
        $student->programme->academicSupervisorAssignments()
            ->where('academic_supervisor_id', $supervisor->academic_supervisor_id)->firstOrFail();
    }

    private function selection(Student $student, AcademicSupervisor|IndustrySupervisor $supervisor, string $type): array
    {
        $ownerField = $type === 'Academic Supervisor' ? 'academic_supervisor_id' : 'industry_supervisor_id';
        $query = EvaluationSubmission::where('student_id', $student->student_id)
            ->where('supervisor_type', $type)->where($ownerField, $supervisor->getKey());
        $existing = (clone $query)->latest('submitted_at')->latest('id')->first();
        $template = EvaluationTemplate::with('sections.criteria.ratingLevels')
            ->when($existing, fn ($q) => $q->whereKey($existing->evaluation_template_id),
                fn ($q) => $q->where('supervisor_type', $type)->where('is_active', true))
            ->latest('version')->first();
        abort_unless($template, 404, 'There is no evaluation template available for this assessment.');
        return [$template, $existing];
    }
}
