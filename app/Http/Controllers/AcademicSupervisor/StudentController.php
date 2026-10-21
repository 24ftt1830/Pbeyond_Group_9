<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\School;
use App\Models\IndustrySupervisor;
use App\Models\Evaluation;
use App\Models\EvaluationSubmission;
use App\Models\EvaluationTemplate;
use App\Services\InternshipCompletionStatus;
use App\Services\InternshipWorkflow;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $filters = $request->validate([
            'school_id' => ['nullable', 'integer', 'exists:schools,school_id'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);
        $studentQuery = Student::query()->with('programme.school')
            ->when($filters['school_id'] ?? null, fn ($query, $schoolId) => $query->whereHas('programme', fn ($programme) => $programme->where('school_id', $schoolId)))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($names) => $names->where('full_name', 'like', '%'.$search.'%')->orWhere('pb_student_code', 'like', '%'.$search.'%')));
        $students = (clone $studentQuery)->whereHas(
            'academicSupervisorAssignments',
            function ($query) use ($academicSupervisor) {
                $query->where(
                    'academic_supervisor_id',
                    $academicSupervisor->academic_supervisor_id
                );
            }
        )
            ->orderBy('full_name')->get();

        return Inertia::render('AcademicSupervisor/Students', [
            'students' => $students,
            'availableStudents' => (clone $studentQuery)->whereDoesntHave('academicSupervisorAssignments')
                ->orderBy('full_name')->get(['student_id', 'programme_id', 'full_name', 'pb_student_code']),
            'schools' => School::orderBy('school_name')->get(['school_id', 'school_code', 'school_name']),
            'filters' => $filters,
        ]);
    }

    public function assign(Request $request)
    {
        $data = $request->validate(['student_id' => ['required', 'integer', 'exists:students,student_id']]);
        $supervisor = AcademicSupervisor::where('user_id', $request->user()->user_id)->firstOrFail();
        DB::transaction(function () use ($data, $supervisor) {
            $student = Student::whereKey($data['student_id'])->lockForUpdate()->firstOrFail();
            $assignment = $student->academicSupervisorAssignments()->first();
            if ($assignment) {
                if ((int) $assignment->academic_supervisor_id === (int) $supervisor->academic_supervisor_id) {
                    return;
                }
                throw ValidationException::withMessages(['student_id' => 'This student already has a PB Supervisor. Ask Admin to correct the existing assignment.']);
            }
            $student->academicSupervisorAssignments()->create([
                'academic_supervisor_id' => $supervisor->academic_supervisor_id,
                'monitoring_status' => 'On Track',
            ]);
            $student->internshipCompletion?->resetAcademicDecision();
        }, 3);
        return back()->with('success', 'Student added to your supervision list.');
    }

    public function show(Request $request, Student $student)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignment = $student->academicSupervisorAssignments()
            ->where(
                'academic_supervisor_id',
                $academicSupervisor->academic_supervisor_id
            )
            ->firstOrFail();

        $student->load([
            'programme',
            'skills',
            'languages',
            'education',
            'professionalProfile',
            'projects',
            'activities',
            'achievements',
            'referees',
            'softSkills',
            'workExperiences',
        ]);

        $visits = $assignment->visits()
            ->orderByDesc('visit_date')
            ->get();

        $evaluation = Evaluation::where('student_id', $student->student_id)
            ->first();
        $academicEvaluation = EvaluationSubmission::where('student_id', $student->student_id)
            ->where('academic_supervisor_id', $academicSupervisor->academic_supervisor_id)
            ->latest('submitted_at')->latest('id')->first();
        $industryEvaluation = EvaluationSubmission::where('student_id', $student->student_id)
            ->whereIn('industry_supervisor_id', IndustrySupervisor::whereHas('students', fn ($query) => $query->where('students.student_id', $student->student_id))->select('supervisor_id'))
            ->where('supervisor_type', 'Industry Supervisor')->latest('submitted_at')->latest('id')->first();

        return Inertia::render('AcademicSupervisor/StudentDetails', [
            'student' => $student,
            'visits' => $visits,
            'evaluation' => $evaluation,
            'academicEvaluation' => $academicEvaluation,
            'industryEvaluation' => $industryEvaluation,
            'hasActiveEvaluationTemplate' => EvaluationTemplate::where('supervisor_type', 'Academic Supervisor')
                ->where('is_active', true)->exists(),
            'monitoringStatus' => $assignment->monitoring_status,
            'finalReport' => $student->finalInternshipReport,
            'completionRecord' => $student->internshipCompletion?->only([
                'industry_confirmation_status',
                'industry_confirmed_at',
                'academic_completion_status',
                'academic_completion_decided_at',
            ]),
            'canFinalizeCompleted' => app(InternshipCompletionStatus::class)->canAcademicFinalize($student, 'Completed'),
            'canFinalizeIncomplete' => app(InternshipCompletionStatus::class)->canAcademicFinalize($student, 'Incomplete'),
            'completionStatus' => app(InternshipCompletionStatus::class)->for($student),
            'overallScore' => app(InternshipCompletionStatus::class)->overallScore($student),
            'attendance' => app(\App\Services\AttendanceService::class)->summary($student),
            'pendingLogbookCorrections' => app(InternshipCompletionStatus::class)->pendingLogbookCorrections($student),
            'completionHistory' => app(\App\Services\InternshipRecordHistory::class)->for($student),
        ]);
    }

    public function updateCompletionDecision(Request $request, Student $student): RedirectResponse
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $student->academicSupervisorAssignments()
            ->where('academic_supervisor_id', $academicSupervisor->academic_supervisor_id)
            ->firstOrFail();

        $validated = $request->validate([
            'decision' => ['required', 'in:Completed,Incomplete'],
        ]);

        app(InternshipWorkflow::class)->decide($student, $validated['decision'], $request->user(), $academicSupervisor);

        return back()->with('success', 'Final internship completion decision saved.');
    }

    public function updateMonitoringStatus(
        Request $request,
        Student $student
    ) {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignment = $student->academicSupervisorAssignments()
            ->where(
                'academic_supervisor_id',
                $academicSupervisor->academic_supervisor_id
            )
            ->firstOrFail();

        $validated = $request->validate([
            'monitoring_status' => [
                'required',
                'in:On Track,Needs Attention,At Risk',
            ],
        ]);

        $assignment->update([
            'monitoring_status' => $validated['monitoring_status'],
        ]);

        return redirect()
            ->route(
                'academic-supervisor.student.show',
                $student->student_id
            )
            ->with('success', 'Monitoring status updated successfully.');
    }
}
