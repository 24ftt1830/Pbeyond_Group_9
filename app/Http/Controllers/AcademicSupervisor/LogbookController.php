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
            ->whereIn('status', ['submitted', 'pending', 'pending_fix'])
            ->orderBy('submitted_at', 'desc')
            ->get();

        $reviewedSubmissions = LogbookWeeklySubmission::with('student')
            ->whereIn('student_id', $assignedStudentIds)
            ->whereIn('status', ['reviewed', 'approved'])
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
                'id', // Include ID so React key bindings and flagged entries track properly
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
                'supervisor_feedback' => $submission->supervisor_feedback,
                'flagged_entries' => $submission->flagged_entries ?? [], // Pass flagged entries back to React
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
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = $academicSupervisor->assignments()
            ->where('student_id', $submission->student_id)
            ->exists();

        abort_unless($isAssigned, 403);

        $validated = $request->validate([
            'status' => 'required|in:approved,pending_fix',
            'supervisor_feedback' => 'nullable|string',
            'flagged_entries' => 'nullable|array',
        ]);

        $submission->update([
            'status' => $validated['status'],
            'supervisor_feedback' => $validated['supervisor_feedback'] ?? null,
            'reviewed_at' => now(),
            // Ensure 'flagged_entries' is in your $fillable array if using a JSON column on your table
            'flagged_entries' => $validated['flagged_entries'] ?? [],
        ]);

        // Redirect back to the Logbook list page instead of back()
        return redirect('/academic-supervisor/logbook')->with('success', 'Logbook review updated successfully.');
    }
}