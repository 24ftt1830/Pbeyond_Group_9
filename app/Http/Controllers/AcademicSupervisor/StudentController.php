<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\Evaluation;
use App\Models\EvaluationSubmission;
use App\Models\EvaluationTemplate;
use App\Services\InternshipCompletionStatus;
use App\Services\InternshipWorkflow;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignedClass = $academicSupervisor->assignments()
            ->with('programme')
            ->first()
            ?->programme;

        $students = Student::whereHas(
            'academicSupervisorAssignments',
            function ($query) use ($academicSupervisor) {
                $query->where(
                    'academic_supervisor_id',
                    $academicSupervisor->academic_supervisor_id
                );
            }
        )
            ->with('programme')
            ->get();

        return Inertia::render('AcademicSupervisor/Students', [
            'students' => $students,
            'assignedClass' => $assignedClass
                ? $assignedClass->only(['class_id', 'programme_name'])
                : null,
        ]);
    }

    public function show(Request $request, Student $student)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignment = $student->programme->academicSupervisorAssignments()
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
        ]);
    }

    public function updateCompletionDecision(Request $request, Student $student): RedirectResponse
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $programme = $student->programme;
        abort_unless($programme, 404);

        $programme->academicSupervisorAssignments()
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

        $assignment = $student->programme->academicSupervisorAssignments()
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
