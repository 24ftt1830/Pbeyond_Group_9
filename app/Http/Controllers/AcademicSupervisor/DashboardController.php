<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\AcademicSupervisorVisit;
use App\Models\Evaluation;
use App\Models\FinalInternshipReport;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Services\InternshipCompletionStatus;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $supervisor = AcademicSupervisor::where('user_id', Auth::id())
            ->with(['assignments.student.programme'])
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
        $pendingEvaluationReviews = (clone $evaluations)
            ->where('academic_review_status', 'Pending Review')
            ->count();
        $pendingReports = FinalInternshipReport::whereIn('student_id', $studentIds)
            ->whereNotNull('submitted_at')
            ->where('academic_review_status', 'Pending Review')
            ->count();
        $logbookSubmissions = LogbookWeeklySubmission::whereIn('student_id', $studentIds)
            ->whereNotNull('submitted_at')
            ->count();

        $decisionCandidates = Student::whereIn('student_id', $studentIds)
            ->whereHas('internshipCompletion', function ($query) {
                $query->whereIn('industry_confirmation_status', ['Confirmed', 'Changes Required'])
                    ->where('academic_completion_status', 'Pending Evaluation');
            })
            ->whereHas('finalInternshipReport', function ($query) {
                $query->whereNotNull('submitted_at')
                    ->whereNotNull('pdf_path')
                    ->whereIn('academic_review_status', ['Approved', 'Changes Required'])
                    ->whereNull('reopened_at');
            })
            ->with(['programme', 'finalInternshipReport', 'internshipCompletion'])
            ->get();
        $completionStatus = app(InternshipCompletionStatus::class);
        $readyCompletionDecisions = $decisionCandidates
            ->filter(fn ($student) =>
                $completionStatus->canAcademicFinalize($student, 'Completed')
                || $completionStatus->canAcademicFinalize($student, 'Incomplete')
            )
            ->values();

        $reviewQueue = collect();

        $reviewQueue = $reviewQueue->merge(
            FinalInternshipReport::with('student:student_id,full_name')
                ->whereIn('student_id', $studentIds)
                ->whereNotNull('submitted_at')
                ->where('academic_review_status', 'Pending Review')
                ->orderByDesc('submitted_at')
                ->limit(3)
                ->get()
                ->map(fn ($report) => [
                    'key' => 'report-' . $report->student_id,
                    'type' => 'Written report',
                    'title' => $report->title ?: 'Written report submitted for review',
                    'student_name' => $report->student?->full_name ?? 'Student',
                    'sort_at' => $report->submitted_at?->toDateTimeString() ?? '',
                    'href' => route('academic-supervisor.student.final-report', $report->student_id),
                ])
        );

        $reviewQueue = $reviewQueue->merge(
            (clone $evaluations)
                ->with('student:student_id,full_name')
                ->where('academic_review_status', 'Pending Review')
                ->orderByDesc('updated_at')
                ->limit(3)
                ->get()
                ->map(fn ($evaluation) => [
                    'key' => 'evaluation-' . $evaluation->evaluation_id,
                    'type' => 'Evaluation review',
                    'title' => 'Supervisor evaluation',
                    'student_name' => $evaluation->student?->full_name ?? 'Student',
                    'sort_at' => $evaluation->updated_at?->toDateTimeString() ?? '',
                    'href' => route('academic-supervisor.student.show', $evaluation->student_id),
                ])
        );

        $reviewQueue = $reviewQueue->merge(
            $readyCompletionDecisions->map(fn ($student) => [
                'key' => 'completion-' . $student->student_id,
                'type' => 'Final decision',
                'title' => 'Final completion decision is ready',
                'student_name' => $student->full_name ?? 'Student',
                'sort_at' => $student->updated_at?->toDateTimeString() ?? '',
                'href' => route('academic-supervisor.student.show', $student->student_id),
            ])
        );

        $reviewQueue = $reviewQueue
            ->sortByDesc('sort_at')
            ->take(6)
            ->values()
            ->map(function ($item) {
                unset($item['sort_at']);
                return $item;
            });

        $assignmentIds = $assignments->pluck('assignment_id');
        $recentVisits = AcademicSupervisorVisit::whereIn('assignment_id', $assignmentIds)
            ->with('assignment.student')
            ->orderByDesc('visit_date')
            ->limit(5)
            ->get()
            ->map(fn ($visit) => [
                'visit_id' => $visit->visit_id,
                'visit_date' => $visit->visit_date,
                'notes' => $visit->notes,
                'student_name' => $visit->assignment?->student?->full_name,
            ]);

        return Inertia::render('AcademicSupervisor/Dashboard', [
            'stats' => [
                'students' => $students->count(),
                'logbook_submissions' => $logbookSubmissions,
                'pending_reviews' => $pendingEvaluationReviews + $pendingReports,
                'final_decisions_ready' => $readyCompletionDecisions->count(),
                'needs_attention' => $assignments->whereIn('monitoring_status', ['Needs Attention', 'At Risk'])->count(),
            ],
            'recentVisits' => $recentVisits,
            'reviewQueue' => $reviewQueue,
        ]);
    }
}
