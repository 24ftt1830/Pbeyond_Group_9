<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\AcademicSupervisorVisit;
use App\Models\Evaluation;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $supervisor = AcademicSupervisor::where('user_id', Auth::id())
            ->with(['assignments.programme'])
            ->firstOrFail();

        $assignments = $supervisor->assignments;
        $students = Student::whereHas('academicSupervisorAssignments', function ($query) use ($supervisor) {
            $query->where('academic_supervisor_id', $supervisor->academic_supervisor_id);
        })
            ->with('programme')
            ->orderBy('full_name')
            ->get();

        $studentIds = $students->pluck('student_id');
        $evaluations = Evaluation::whereIn('student_id', $studentIds);
        $pendingReviews = (clone $evaluations)
            ->where('academic_review_status', 'Pending Review')
            ->count();
        $completedReviews = (clone $evaluations)
            ->where('academic_review_status', 'Completed')
            ->count();

        $assignmentIds = $assignments->pluck('assignment_id');
        $recentVisits = AcademicSupervisorVisit::whereIn('assignment_id', $assignmentIds)
            ->with('assignment.programme')
            ->orderByDesc('visit_date')
            ->limit(5)
            ->get()
            ->map(fn ($visit) => [
                'visit_id' => $visit->visit_id,
                'visit_date' => $visit->visit_date,
                'notes' => $visit->notes,
                'class_name' => $visit->assignment?->programme?->programme_name,
            ]);

        return Inertia::render('AcademicSupervisor/Dashboard', [
            'assignedClass' => $assignments->first()?->programme?->only(['class_id', 'programme_name']),
            'stats' => [
                'students' => $students->count(),
                'visits' => AcademicSupervisorVisit::whereIn('assignment_id', $assignmentIds)->count(),
                'pending_reviews' => $pendingReviews,
                'completed_reviews' => $completedReviews,
                'monitoring_status' => $assignments->first()?->monitoring_status ?? 'Not set',
            ],
            'students' => $students->take(5)->values(),
            'recentVisits' => $recentVisits,
        ]);
    }
}
