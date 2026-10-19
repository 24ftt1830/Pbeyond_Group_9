<?php

namespace App\Http\Controllers\IndustrySupervisor;

use App\Http\Controllers\Controller;
use App\Models\EvaluationSubmission;
use App\Models\EvaluationTemplate;
use App\Models\IndustrySupervisor;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $supervisor = IndustrySupervisor::where('user_id', Auth::id())
            ->with('company')
            ->firstOrFail();

        $applications = $supervisor->applications()
            ->where('applications.app_status', 'Recruited')
            ->with(['student.programme', 'student.internship', 'student.internshipCompletion'])
            ->orderByDesc('applications.updated_at')
            ->get();

        $assignedApplications = $applications->unique('student_id')->values();
        $studentIds = $assignedApplications->pluck('student_id');
        $hasActiveEvaluationTemplate = EvaluationTemplate::where('supervisor_type', 'Industry Supervisor')
            ->where('is_active', true)
            ->exists();
        $latestEvaluations = EvaluationSubmission::where('industry_supervisor_id', $supervisor->supervisor_id)
            ->whereIn('student_id', $studentIds)
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->get()
            ->unique('student_id')
            ->keyBy('student_id');

        $today = now()->toDateString();
        $students = $assignedApplications->map(function ($application) use ($latestEvaluations, $today) {
            $student = $application->student;
            $evaluation = $latestEvaluations->get($student->student_id);
            $internship = $student->internship;
            $completion = $student->internshipCompletion;
            $internshipEnded = $internship && $internship->end_date->toDateString() <= $today;
            $completionStatus = $completion?->industry_confirmation_status;

            return [
                'student_id' => $student->student_id,
                'full_name' => $student->full_name,
                'pb_student_code' => $student->pb_student_code,
                'programme_name' => $student->programme?->programme_name,
                'internship_start_date' => $internship?->start_date?->toDateString(),
                'internship_end_date' => $internship?->end_date?->toDateString(),
                'evaluation_due' => !$evaluation || $evaluation->reopened_at !== null,
                'completion_confirmation_due' => $internshipEnded
                    && $completionStatus !== 'Confirmed'
                    && $completion?->academic_completion_status !== 'Completed',
            ];
        })->sortByDesc(fn ($student) =>
            (int) $student['evaluation_due'] + (int) $student['completion_confirmation_due']
        )->values();

        $evaluationsDue = $students->where('evaluation_due', true)->count();
        $completionConfirmationsDue = $students->where('completion_confirmation_due', true)->count();

        return Inertia::render('IndustrySupervisor/Dashboard', [
            'company' => $supervisor->company?->only(['company_id', 'company_name']),
            'stats' => [
                'students_assigned' => $students->count(),
                'evaluations_due' => $evaluationsDue,
                'completion_confirmations_due' => $completionConfirmationsDue,
                'students_with_dates' => $students->filter(fn ($student) =>
                    $student['internship_start_date'] && $student['internship_end_date']
                )->count(),
            ],
            'hasActiveEvaluationTemplate' => $hasActiveEvaluationTemplate,
            'students' => $students->take(6)->values(),
        ]);
    }
}
