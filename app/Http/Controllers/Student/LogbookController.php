<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LogbookEntry;
use App\Models\LogbookReminder;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Services\LogbookTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;
        $internship = $student->internship;
        $isRecruited = $student->applications()->where('app_status', 'Recruited')->exists();
        $missingWeeks = app(LogbookTracking::class)->missingWeeks($student);

        $entries = LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->get([
                'id',
                'date',
                'status',
                'description',
                'learning_outcomes',
                'issues',
            ])
            ->mapWithKeys(function ($entry) {
                return [
                    $entry->date->format('Y-m-d') => [
                        'id' => $entry->id,
                        'status' => $entry->status,
                        'description' => $entry->description,
                        'learning_outcomes' => $entry->learning_outcomes,
                        'issues' => $entry->issues,
                    ],
                ];
            });

        $weeklySubmissions = LogbookWeeklySubmission::where(
            'student_id',
            $student->student_id
        )
            ->get([
                'week_start',
                'week_end',
                'status',
                'supervisor_feedback',
                'flagged_entries',
                'submitted_at',
                'reviewed_at',
            ])
            ->mapWithKeys(function ($submission) {
                return [
                    $submission->week_start->format('Y-m-d') => [
                        'week_start' => $submission->week_start->format('Y-m-d'),
                        'week_end' => $submission->week_end->format('Y-m-d'),
                        'status' => $submission->status,
                        'supervisor_feedback' => $submission->supervisor_feedback,
                        'flagged_entries' => $submission->flagged_entries ?? [],
                        'submitted_at' => $submission->submitted_at,
                        'reviewed_at' => $submission->reviewed_at,
                    ],
                ];
            });

        return Inertia::render('Student/Logbook', [
            'entries' => $entries,
            'weeklySubmissions' => $weeklySubmissions,
            'missingLogbookWeeks' => $missingWeeks,
            'isRecruited' => $isRecruited,
            'internshipPeriod' => $internship ? [
                'start_date' => $internship->start_date->toDateString(),
                'end_date' => $internship->end_date->toDateString(),
            ] : null,
            'today' => now()->toDateString(),
        ]);
    }

    public function create(Request $request)
    {
        $student = $request->user()->student;
        $date = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ])['date'];

        if ($restriction = $this->dateRestriction($student, $date)) {
            return redirect()
                ->route('student.logbook', ['week' => $date])
                ->withErrors(['date' => $restriction]);
        }

        $entry = LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->whereDate('date', $date)
            ->first();

        $weekSubmission = LogbookWeeklySubmission::where(
            'student_id',
            $student->student_id
        )
            ->whereDate('week_start', '<=', $date)
            ->whereDate('week_end', '>=', $date)
            ->first();

        // Check whether this date belongs to a reviewed weekly submission.
        $isReviewed = $weekSubmission
            && in_array($weekSubmission->status, ['reviewed', 'approved'], true);

        if ($isReviewed) {
            return redirect()
                ->route('student.logbook', ['week' => $date])
                ->withErrors([
                    'week' => 'This day has already been reviewed and can no longer be edited.',
                ]);
        }

        return Inertia::render('Student/LogbookSubmission', [
            'date' => $date,
            'entry' => $entry
                ? [
                    'id' => $entry->id,
                    'status' => $entry->status,
                    'description' => $entry->description,
                    'learning_outcomes' => $entry->learning_outcomes,
                    'issues' => $entry->issues,
                ]
                : null,
            'weekSubmission' => $weekSubmission
                ? [
                    'status' => $weekSubmission->status,
                    'supervisor_feedback' => $weekSubmission->supervisor_feedback,
                    'flagged_entries' => $weekSubmission->flagged_entries ?? [],
                ]
                : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'status' => ['required', 'in:working,off,none'],
            'description' => ['nullable', 'string'],
            'learning_outcomes' => ['nullable', 'string'],
            'issues' => ['nullable', 'string'],
        ]);

        $student = $request->user()->student;

        $entryDate = $validated['date'];

        if ($restriction = $this->dateRestriction($student, $entryDate)) {
            return redirect()
                ->route('student.logbook', ['week' => $entryDate])
                ->withErrors(['date' => $restriction]);
        }

        $isReviewed = LogbookWeeklySubmission::where(
            'student_id',
            $student->student_id
        )
            ->whereIn('status', ['reviewed', 'approved'])
            ->whereDate('week_start', '<=', $entryDate)
            ->whereDate('week_end', '>=', $entryDate)
            ->exists();

        if ($isReviewed) {
            return back()->withErrors([
                'week' => 'This day has already been reviewed and can no longer be edited.',
            ]);
        }

        if ($validated['status'] === 'none') {
            LogbookEntry::where(
                'student_id',
                $student->student_id
            )
                ->whereDate('date', $validated['date'])
                ->delete();

            return redirect()
                ->route('student.logbook', ['week' => $validated['date']])
                ->with('success', 'Day cleared successfully.');
        }

        if ($validated['status'] === 'off') {
            LogbookEntry::updateOrCreate(
                [
                    'student_id' => $student->student_id,
                    'date' => $validated['date'],
                ],
                [
                    'status' => 'off',
                    'description' => null,
                    'learning_outcomes' => null,
                    'issues' => null,
                ]
            );

            return redirect()
                ->route('student.logbook', ['week' => $validated['date']])
                ->with('success', 'Off Day saved successfully.');
        }

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'status' => ['required', 'in:working'],
            'description' => ['required', 'string'],
            'learning_outcomes' => ['required', 'string'],
            'issues' => ['nullable', 'string'],
        ]);

        LogbookEntry::updateOrCreate(
            [
                'student_id' => $student->student_id,
                'date' => $validated['date'],
            ],
            [
                'status' => 'working',
                'description' => $validated['description'],
                'learning_outcomes' => $validated['learning_outcomes'],
                'issues' => $validated['issues'],
            ]
        );

        return redirect()
            ->route('student.logbook', ['week' => $validated['date']])
            ->with('success', 'Daily log saved successfully.');
    }

    public function submitWeek(Request $request)
    {
        $student = $request->user()->student;

        if (!$student->applications()->where('app_status', 'Recruited')->exists()) {
            return back()->withErrors([
                'week' => 'Your logbook will become available after recruitment and internship dates are assigned.',
            ]);
        }

        $weekStart = $request->validate([
            'week_start' => ['required', 'date_format:Y-m-d'],
        ])['week_start'];

        $weekStartDate = Carbon::parse($weekStart)->startOfWeek();
        $weekEndDate = $weekStartDate->copy()->endOfWeek();
        $internship = $student->internship;

        if (!$internship) {
            return back()->withErrors([
                'week' => 'Your internship dates have not been set yet.',
            ]);
        }

        $activeStartDate = $weekStartDate->gt($internship->start_date)
            ? $weekStartDate->copy()
            : $internship->start_date->copy();
        $activeEndDate = $weekEndDate->lt($internship->end_date)
            ? $weekEndDate->copy()
            : $internship->end_date->copy();

        if ($activeStartDate->gt($activeEndDate)) {
            return back()->withErrors([
                'week' => 'This week is outside your internship period.',
            ]);
        }

        if ($activeEndDate->gt(now()->startOfDay())) {
            return back()->withErrors([
                'week' => 'You can submit a week after all internship dates in that week have happened.',
            ]);
        }

        $entries = LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->whereBetween('date', [
                $activeStartDate->toDateString(),
                $activeEndDate->toDateString(),
            ])
            ->get();

        $expectedDays = (int) $activeStartDate->diffInDays($activeEndDate) + 1;

        if ($entries->count() !== $expectedDays) {
            return back()->withErrors([
                'week' => "You must complete all {$expectedDays} internship day(s) in this week before submitting.",
            ]);
        }

        $hasIncompleteDay = $entries->contains(function ($entry) {
            return !in_array($entry->status, ['working', 'off']);
        });

        if ($hasIncompleteDay) {
            return back()->withErrors([
                'week' => 'Every day must be marked as Working Day or Off Day.',
            ]);
        }

        $invalidWorkingDay = $entries->contains(function ($entry) {
            return $entry->status === 'working'
                && (
                    empty($entry->description)
                    || empty($entry->learning_outcomes)
                );
        });

        if ($invalidWorkingDay) {
            return back()->withErrors([
                'week' => 'All Working Days must have Activities and Learning Outcomes.',
            ]);
        }

        $existingSubmission = LogbookWeeklySubmission::where(
            'student_id',
            $student->student_id
        )
            ->whereDate('week_start', $weekStartDate)
            ->first();

        if ($existingSubmission) {
            if (in_array($existingSubmission->status, ['pending_fix', 'revision', 'needs_revision'], true)) {
                $existingSubmission->update([
                    'status' => 'submitted',
                    'submitted_at' => now(),
                ]);

                LogbookReminder::where('student_id', $student->student_id)
                    ->whereDate('week_start', $weekStartDate)
                    ->delete();

                return back()->with(
                    'success',
                    'Weekly logbook resubmitted successfully.'
                );
            }

            LogbookReminder::where('student_id', $student->student_id)
                ->whereDate('week_start', $weekStartDate)
                ->delete();

            return back()->withErrors([
                'week' => 'This week has already been submitted.',
            ]);
        }

        LogbookWeeklySubmission::create([
            'student_id' => $student->student_id,
            'week_start' => $weekStartDate,
            'week_end' => $weekEndDate,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        LogbookReminder::where('student_id', $student->student_id)
            ->whereDate('week_start', $weekStartDate)
            ->delete();

        return back()->with(
            'success',
            'Weekly logbook submitted successfully.'
        );
    }

    public function destroy(Request $request, string $date)
    {
        $student = $request->user()->student;
        $date = validator(['date' => $date], [
            'date' => ['required', 'date_format:Y-m-d'],
        ])->validate()['date'];

        if ($restriction = $this->dateRestriction($student, $date)) {
            return redirect()
                ->route('student.logbook', ['week' => $date])
                ->withErrors(['date' => $restriction]);
        }

        $weekSubmission = LogbookWeeklySubmission::where('student_id', $student->student_id)
            ->whereDate('week_start', '<=', $date)
            ->whereDate('week_end', '>=', $date)
            ->first();

        if ($weekSubmission && in_array($weekSubmission->status, ['reviewed', 'approved'], true)) {
            return redirect()
                ->route('student.logbook', ['week' => $date])
                ->withErrors(['date' => 'This week has already been reviewed and can no longer be edited.']);
        }

        LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->whereDate('date', $date)
            ->delete();

        return redirect()
            ->route('student.logbook', ['week' => $date])
            ->with('success', 'Daily log deleted successfully.');
    }

    private function dateRestriction(Student $student, string $date): ?string
    {
        if (!$student->applications()->where('app_status', 'Recruited')->exists()) {
            return 'Your logbook will become available after recruitment and internship dates are assigned.';
        }

        $internship = $student->internship;

        if (!$internship) {
            return 'Your internship dates have not been set yet. Please contact your company HR.';
        }

        $entryDate = Carbon::parse($date)->startOfDay();

        if ($entryDate->lt($internship->start_date->copy()->startOfDay())) {
            return 'You cannot enter a logbook before your internship start date.';
        }

        if ($entryDate->gt($internship->end_date->copy()->startOfDay())) {
            return 'You cannot enter a logbook after your internship end date.';
        }

        if ($entryDate->gt(now()->startOfDay())) {
            return 'You can only fill in logbooks for today or an earlier date.';
        }

        return null;
    }
}
