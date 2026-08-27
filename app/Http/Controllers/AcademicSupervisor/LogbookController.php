<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\LogbookEntry;
use App\Models\LogbookWeeklySubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index(Request $request)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignedStudentIds = $academicSupervisor->assignments()
            ->pluck('student_id');

        $pendingSubmissions = LogbookWeeklySubmission::with('student')
            ->whereIn('student_id', $assignedStudentIds)
            ->whereIn('status', ['submitted', 'pending'])
            ->orderBy('submitted_at', 'desc')
            ->get();

        $reviewedSubmissions = LogbookWeeklySubmission::with('student')
            ->whereIn('student_id', $assignedStudentIds)
            ->where('status', 'reviewed')
            ->orderBy('reviewed_at', 'desc')
            ->get();

        return Inertia::render('AcademicSupervisor/Logbook', [
            'pendingSubmissions' => $pendingSubmissions,
            'reviewedSubmissions' => $reviewedSubmissions,
        ]);
    }

    public function review(
        Request $request,
        LogbookWeeklySubmission $submission
    ) {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = $academicSupervisor->assignments()
            ->where('student_id', $submission->student_id)
            ->exists();

        abort_unless($isAssigned, 403);
        // When the supervisor opens a newly submitted week,
        // change its status from submitted to pending.
        if ($submission->status === 'submitted') {
            $submission->update([
                'status' => 'pending',
            ]);
        }

        $entries = LogbookEntry::where(
            'student_id',
            $submission->student_id
        )
            ->whereBetween('date', [
                $submission->week_start,
                $submission->week_end,
            ])
            ->orderBy('date')
            ->get([
                'date',
                'status',
                'description',
                'learning_outcomes',
                'issues',
            ]);

        return Inertia::render('AcademicSupervisor/LogbookReview', [
            'submission' => [
                'id' => $submission->id,
                'student_id' => $submission->student_id,
                'week_start' => $submission->week_start,
                'week_end' => $submission->week_end,
                'status' => $submission->status,
                'submitted_at' => $submission->submitted_at,
                'reviewed_at' => $submission->reviewed_at,
            ],
            'entries' => $entries,
        ]);
    }

    public function markReviewed(
        Request $request,
        LogbookWeeklySubmission $submission
    ) {
        if ($submission->status !== 'pending') {
            return back()->withErrors([
                'review' => 'This weekly logbook has already been reviewed.',
            ]);
        }

        $submission->update([
            'status' => 'reviewed',
            'reviewed_at' => now(),
        ]);

        return redirect()
            ->route('academic-supervisor.logbook')
            ->with('success', 'Weekly logbook marked as reviewed.');
    }
}