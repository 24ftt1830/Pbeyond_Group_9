<?php

namespace App\Http\Controllers\IndustrySupervisor;

use App\Http\Controllers\Controller;
use App\Models\IndustrySupervisor;
use App\Models\EvaluationSubmission;
use App\Models\Evaluation;
use App\Models\EvaluationTemplate;
use App\Models\InternshipCompletion;
use App\Services\InternshipCompletionStatus;
use App\Services\InternshipWorkflow;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $industrySupervisor = IndustrySupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->with('quota')->firstOrFail();

        $students = $industrySupervisor->quota_id
            ? Student::whereHas('applications', function ($query) use ($industrySupervisor) {
                $query->where('quota_id', $industrySupervisor->quota_id)
                    ->where('app_status', 'Recruited');
            })
                ->with('programme')
                ->orderBy('full_name')
                ->get()
            : collect();

        return Inertia::render('IndustrySupervisor/Students', [
            'students' => $students,
            'quota' => $industrySupervisor->quota,
        ]);
    }

    public function show(Request $request, Student $student)
    {
        $industrySupervisor = IndustrySupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = $industrySupervisor->applications()
            ->where('student_id', $student->student_id)
            ->where('app_status', 'Recruited')
            ->exists();

        abort_unless($isAssigned, 403);

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

        return Inertia::render('IndustrySupervisor/StudentDetails', [
            'student' => $student,
            'quota' => $industrySupervisor->quota()->first(),
            'evaluationSubmission' => EvaluationSubmission::where('student_id', $student->student_id)
                ->where('industry_supervisor_id', $industrySupervisor->supervisor_id)->latest('submitted_at')->latest('id')->first(),
            'legacyEvaluation' => Evaluation::where('student_id', $student->student_id)
                ->where('industry_supervisor_id', $industrySupervisor->supervisor_id)->first(),
            'completionRecord' => $student->internshipCompletion?->only([
                'industry_confirmation_status',
                'industry_confirmed_at',
                'academic_completion_status',
            ]),
            'hasActiveEvaluationTemplate' => EvaluationTemplate::where('supervisor_type', 'Industry Supervisor')
                ->where('is_active', true)->exists(),
            'completionStatus' => app(InternshipCompletionStatus::class)->for($student),
            'overallScore' => app(InternshipCompletionStatus::class)->overallScore($student),
        ]);
    }

    public function updateCompletionConfirmation(Request $request, Student $student): RedirectResponse
    {
        $industrySupervisor = IndustrySupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        abort_unless(
            $industrySupervisor->applications()
                ->where('student_id', $student->student_id)
                ->where('app_status', 'Recruited')
                ->exists(),
            403
        );

        $academicDecisionIsComplete = InternshipCompletion::where('student_id', $student->student_id)
            ->where('academic_completion_status', 'Completed')
            ->exists();

        if ($academicDecisionIsComplete) {
            throw ValidationException::withMessages([
                'status' => 'This confirmation is locked because final internship completion has been confirmed.',
            ]);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:Confirmed,Changes Required'],
        ]);

        app(InternshipWorkflow::class)->confirmCompany($student, $validated['status'], $request->user(), $industrySupervisor);

        return back()->with('success', 'Company internship confirmation updated.');
    }
}
