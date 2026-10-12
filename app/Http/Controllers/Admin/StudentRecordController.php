<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\AcademicSupervisorVisit;
use App\Models\AdminRecordChange;
use App\Models\EvaluationSubmission;
use App\Models\FinalInternshipReport;
use App\Models\IndustrySupervisor;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Services\InternshipCompletionStatus;
use App\Services\InternshipWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StudentRecordController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/StudentRecords', [
            'students' => Student::with(['programme', 'internship', 'user'])
                ->orderBy('full_name')->get(),
        ]);
    }

    public function show(Student $student)
    {
        $student->load([
            'programme.academicSupervisorAssignments.academicSupervisor',
            'programme.academicSupervisorAssignments.visits',
            'user', 'internship', 'internshipCompletion', 'finalInternshipReport',
            'applications.quota.company',
            'skills', 'languages', 'education', 'professionalProfile',
            'projects', 'activities', 'achievements', 'referees',
            'softSkills', 'workExperiences',
        ]);
        $evaluations = EvaluationSubmission::where('student_id', $student->student_id)->latest('submitted_at')->latest('id')->get();
        $completion = app(InternshipCompletionStatus::class);

        return Inertia::render('Admin/StudentRecord', [
            'student' => $student,
            'evaluations' => $evaluations,
            'logbooks' => LogbookWeeklySubmission::where('student_id', $student->student_id)->latest('week_start')->get(),
            'academicSupervisors' => AcademicSupervisor::orderBy('full_name')->get(),
            'completionStatus' => $completion->for($student),
            'overallScore' => $completion->overallScore($student),
            'canFinalizeCompleted' => $completion->canAcademicFinalize($student, 'Completed'),
            'canFinalizeIncomplete' => $completion->canAcademicFinalize($student, 'Incomplete'),
        ]);
    }

    public function dates(Request $request, Student $student)
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);
        app(InternshipWorkflow::class)->dates($student, $data, $request->user());
        return back()->with('success', 'Internship dates updated.');
    }

    public function confirmCompany(Request $request, Student $student)
    {
        $data = $request->validate(['status' => ['required', 'in:Confirmed,Changes Required']]);
        app(InternshipWorkflow::class)->confirmCompany($student, $data['status'], $request->user());
        return back()->with('success', 'Company internship confirmation updated by Superadmin.');
    }

    public function decide(Request $request, Student $student)
    {
        $data = $request->validate(['decision' => ['required', 'in:Completed,Incomplete']]);
        app(InternshipWorkflow::class)->decide($student, $data['decision'], $request->user());
        return back()->with('success', 'Final internship decision updated by Superadmin.');
    }

    public function assignAcademic(Request $request, Student $student)
    {
        $data = $request->validate(['academic_supervisor_id' => ['required', 'exists:academic_supervisors,academic_supervisor_id']]);
        if (!$student->programme?->class_id) {
            throw ValidationException::withMessages(['academic_supervisor_id' => 'The student must belong to a class before assigning a supervisor.']);
        }
        DB::transaction(function () use ($student, $data, $request) {
            $assignment = $student->programme->academicSupervisorAssignments()->firstOrNew();
            $before = $assignment->exists ? $assignment->toArray() : null;
            $assignment->fill($data + ['class_id' => $student->programme->class_id, 'monitoring_status' => $assignment->monitoring_status ?? 'On Track'])->save();
            foreach (Student::whereHas('programme', fn ($query) => $query->where('class_id', $student->programme->class_id))->with('internshipCompletion')->get() as $classStudent) {
                $classStudent->internshipCompletion?->resetAcademicDecision();
            }
            AdminRecordChange::record($request->user(), $assignment, 'Reassigned class academic supervisor', $before);
        });
        return back()->with('success', 'Academic Supervisor assigned to the student’s class.');
    }

    public function monitoring(Request $request, Student $student)
    {
        $data = $request->validate(['monitoring_status' => ['required', 'in:On Track,Needs Attention,At Risk']]);
        $assignment = $student->programme?->academicSupervisorAssignments()->first();
        if (!$assignment) {
            throw ValidationException::withMessages(['monitoring_status' => 'Assign an Academic Supervisor to this class first.']);
        }
        DB::transaction(function () use ($assignment, $data, $request) {
            $before = $assignment->toArray();
            $assignment->update($data);
            AdminRecordChange::record($request->user(), $assignment, 'Updated class monitoring status', $before);
        });
        return back()->with('success', 'Class monitoring status updated.');
    }

    public function visit(Request $request, Student $student)
    {
        $data = $request->validate(['visit_date' => ['required', 'date'], 'notes' => ['required', 'string', 'max:5000']]);
        $assignment = $student->programme?->academicSupervisorAssignments()->first();
        if (!$assignment) {
            throw ValidationException::withMessages(['visit_date' => 'Assign an Academic Supervisor to this class first.']);
        }
        DB::transaction(function () use ($assignment, $data, $request) {
            $visit = $assignment->visits()->create($data);
            AdminRecordChange::record($request->user(), $visit, 'Recorded internship visit');
        });
        return back()->with('success', 'Internship visit recorded.');
    }

    public function updateVisit(Request $request, Student $student, AcademicSupervisorVisit $visit)
    {
        abort_unless($student->programme?->academicSupervisorAssignments()->where('assignment_id', $visit->assignment_id)->exists(), 404);
        $data = $request->validate(['visit_date' => ['required', 'date'], 'notes' => ['required', 'string', 'max:5000']]);
        DB::transaction(function () use ($visit, $data, $request) {
            $before = $visit->toArray();
            $visit->update($data);
            AdminRecordChange::record($request->user(), $visit, 'Updated internship visit', $before);
        });
        return back()->with('success', 'Internship visit updated.');
    }

    public function evaluation(Student $student, EvaluationSubmission $submission)
    {
        abort_unless((int) $submission->student_id === (int) $student->student_id, 404);
        return Inertia::render('Supervisor/EvaluationResult', [
            'student' => $student->only(['student_id', 'pb_student_code', 'full_name']),
            'submission' => $submission,
            'viewer' => 'admin',
            'canReopen' => $this->canReopenEvaluation($student, $submission),
            'history' => AdminRecordChange::where('subject_type', $submission->getMorphClass())
                ->where('subject_id', $submission->getKey())->where('action', 'Reopened evaluation')
                ->oldest()->get(['id', 'before_snapshot', 'created_at']),
        ]);
    }

    public function reopenEvaluation(Request $request, Student $student, EvaluationSubmission $submission)
    {
        abort_unless((int) $submission->student_id === (int) $student->student_id, 404);
        if (!$this->canReopenEvaluation($student, $submission)) {
            throw ValidationException::withMessages(['reopen' => 'Only the latest evaluation belonging to a currently assigned supervisor can be reopened.']);
        }
        DB::transaction(function () use ($submission, $student, $request) {
            $submission = EvaluationSubmission::whereKey($submission->getKey())->lockForUpdate()->firstOrFail();
            if ($submission->reopened_at) {
                throw ValidationException::withMessages(['reopen' => 'This evaluation is already open for correction.']);
            }
            // Retain the original submitted answers, template snapshot and mark.
            $before = $submission->toArray();
            $submission->update(['reopened_at' => now(), 'reopened_by_user_id' => $request->user()->getKey()]);
            AdminRecordChange::record($request->user(), $submission, 'Reopened evaluation', $before);
            $student->internshipCompletion?->resetAcademicDecision();
        });
        return back()->with('success', 'Evaluation reopened for its assigned supervisor. Completion is pending until it is resubmitted.');
    }

    public function reopenReport(Request $request, Student $student)
    {
        if (!$student->programme?->academicSupervisorAssignments()->exists()) {
            throw ValidationException::withMessages(['reopen' => 'Assign an Academic Supervisor before reopening the written report.']);
        }
        DB::transaction(function () use ($student, $request) {
            $report = FinalInternshipReport::where('student_id', $student->student_id)->lockForUpdate()->first();
            if (!$report?->submitted_at || !$report->academic_reviewed_at || $report->reopened_at) {
                throw ValidationException::withMessages(['reopen' => 'Only a reviewed written report can be reopened.']);
            }
            $before = $report->toArray();
            $report->update([
                'academic_review_status' => 'Pending Review',
                'reopened_at' => now(),
                'reopened_by_user_id' => $request->user()->getKey(),
            ]);
            AdminRecordChange::record($request->user(), $report, 'Reopened written report', $before);
            $student->internshipCompletion?->resetAcademicDecision();
        });
        return back()->with('success', 'Written report reopened for the assigned Academic Supervisor. Its original review has been preserved.');
    }

    public function reopenLogbook(Request $request, Student $student, LogbookWeeklySubmission $submission)
    {
        abort_unless((int) $submission->student_id === (int) $student->student_id, 404);
        if (!in_array($submission->status, ['approved', 'reviewed'], true)) {
            throw ValidationException::withMessages(['reopen' => 'Only a reviewed week can be reopened.']);
        }
        DB::transaction(function () use ($submission, $request) {
            $before = $submission->toArray();
            $submission->update(['status' => 'pending_fix', 'reviewed_at' => null]);
            AdminRecordChange::record($request->user(), $submission, 'Reopened logbook for student correction', $before);
        });
        return back()->with('success', 'Logbook reopened. The student can correct and resubmit this week.');
    }

    public function cv(Student $student)
    {
        abort_unless($student->cv_snapshot, 404, 'The student has not generated a CV yet.');
        return Inertia::render('Student/generator_cv', [
            'student' => $student->cv_snapshot,
            'isCompanyView' => true,
            'backHref' => route('admin.students.show', $student),
        ]);
    }

    private function canReopenEvaluation(Student $student, EvaluationSubmission $submission): bool
    {
        if ($submission->reopened_at) {
            return false;
        }
        $latest = EvaluationSubmission::where('student_id', $student->student_id)
            ->where('supervisor_type', $submission->supervisor_type)->latest('submitted_at')->latest('id')->first();
        if ($latest?->id !== $submission->id) {
            return false;
        }
        if ($submission->supervisor_type === 'Academic Supervisor') {
            return (bool) $student->programme?->academicSupervisorAssignments()
                ->where('academic_supervisor_id', $submission->academic_supervisor_id)->exists();
        }
        return IndustrySupervisor::where('supervisor_id', $submission->industry_supervisor_id)
            ->whereIn('quota_id', $student->applications()->where('app_status', 'Recruited')->select('quota_id'))->exists();
    }
}
