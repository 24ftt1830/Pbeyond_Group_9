<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\AdminRecordChange;
use App\Models\LogbookEntry;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
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

        $assignedStudentIds = Student::whereHas(
            'programme.academicSupervisorAssignments',
            function ($query) use ($academicSupervisor) {
                $query->where(
                    'academic_supervisor_id',
                    $academicSupervisor->academic_supervisor_id
                );
            }
        )->pluck('student_id');

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

        $today = now()->startOfDay();
        $lastCompletedWeekStart = $today->copy()->startOfWeek()->subWeek();
        $activeInterns = Student::query()
            ->whereIn('student_id', $assignedStudentIds)
            ->whereHas('internship', function ($query) use ($today) {
                $query->whereDate('start_date', '<=', $today)
                    ->whereDate('end_date', '>=', $today);
            })
            ->with('internship')
            ->orderBy('full_name')
            ->get();

        $activeInternIds = $activeInterns->pluck('student_id');
        $submittedWeekKeys = LogbookWeeklySubmission::query()
            ->whereIn('student_id', $activeInternIds)
            ->whereDate('week_start', '<=', $lastCompletedWeekStart->toDateString())
            ->get(['student_id', 'week_start'])
            ->mapWithKeys(fn ($submission) => [
                $submission->student_id . '|' . $submission->week_start->toDateString() => true,
            ]);

        $missingLogbooks = $activeInterns->map(function ($student) use (
            $lastCompletedWeekStart,
            $submittedWeekKeys
        ) {
            $internship = $student->internship;
            $weekStart = $internship->start_date->copy()->startOfWeek();
            $missingWeeks = [];

            while (
                $weekStart->lte($lastCompletedWeekStart)
                && $weekStart->lte($internship->end_date)
            ) {
                $weekKey = $student->student_id . '|' . $weekStart->toDateString();

                if (!$submittedWeekKeys->has($weekKey)) {
                    $weekEnd = $weekStart->copy()->endOfWeek();

                    $missingWeeks[] = [
                        'week_start' => $weekStart->toDateString(),
                        'week_end' => $weekEnd->toDateString(),
                    ];
                }

                $weekStart->addWeek();
            }

            if ($missingWeeks === []) {
                return null;
            }

            return [
                'student_id' => $student->student_id,
                'student_code' => $student->pb_student_code,
                'full_name' => $student->full_name,
                'missing_weeks' => $missingWeeks,
            ];
        })->filter()->values();

        return Inertia::render('AcademicSupervisor/Logbook', [
            'pendingSubmissions' => $pendingSubmissions,
            'reviewedSubmissions' => $reviewedSubmissions,
            'missingLogbooks' => $missingLogbooks,
        ]);
    }

    public function review(
        Request $request,
        LogbookWeeklySubmission $submission
    ) {
        $academicSupervisor = auth()->user()->role === 'Admin' ? null : AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = auth()->user()->role === 'Admin' || Student::where('student_id', $submission->student_id)
            ->whereHas(
                'programme.academicSupervisorAssignments',
                function ($query) use ($academicSupervisor) {
                    $query->where(
                        'academic_supervisor_id',
                        $academicSupervisor->academic_supervisor_id
                    );
                }
            )
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
            'adminContext' => auth()->user()->role === 'Admin',
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
        $academicSupervisor = auth()->user()->role === 'Admin' ? null : AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = auth()->user()->role === 'Admin' || Student::where('student_id', $submission->student_id)
            ->whereHas(
                'programme.academicSupervisorAssignments',
                function ($query) use ($academicSupervisor) {
                    $query->where(
                        'academic_supervisor_id',
                        $academicSupervisor->academic_supervisor_id
                    );
                }
            )
            ->exists();

        abort_unless($isAssigned, 403);

        $validated = $request->validate([
            'status' => 'required|in:approved,pending_fix',
            'supervisor_feedback' => 'nullable|string',
            'flagged_entries' => 'nullable|array',
        ]);

        $before = $submission->toArray();
        $submission->update([
            'status' => $validated['status'],
            'supervisor_feedback' => $validated['supervisor_feedback'] ?? null,
            'reviewed_at' => now(),
            // Ensure 'flagged_entries' is in your $fillable array if using a JSON column on your table
            'flagged_entries' => $validated['flagged_entries'] ?? [],
        ]);
        AdminRecordChange::record($request->user(), $submission, 'Reviewed weekly logbook', $before);

        // Redirect back to the Logbook list page instead of back()
        return redirect($request->user()->role === 'Admin'
            ? route('admin.students.show', $submission->student_id)
            : route('academic-supervisor.logbook'))->with('success', 'Logbook review updated successfully.');
    }
}
