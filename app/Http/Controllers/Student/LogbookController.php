<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LogbookEntry;
use App\Models\LogbookWeeklySubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;

        $entries = LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->get([
                'date',
                'status',
                'description',
                'learning_outcomes',
                'issues',
            ])
            ->mapWithKeys(function ($entry) {
                return [
                    $entry->date->format('Y-m-d') => [
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
                'submitted_at',
                'reviewed_at',
            ])
            ->mapWithKeys(function ($submission) {
                return [
                    $submission->week_start->format('Y-m-d') => [
                        'week_start' => $submission->week_start->format('Y-m-d'),
                        'week_end' => $submission->week_end->format('Y-m-d'),
                        'status' => $submission->status,
                        'submitted_at' => $submission->submitted_at,
                        'reviewed_at' => $submission->reviewed_at,
                    ],
                ];
            });

        return Inertia::render('Student/Logbook', [
            'entries' => $entries,
            'weeklySubmissions' => $weeklySubmissions,
        ]);
    }

    public function create(Request $request)
    {
        $student = $request->user()->student;
        $date = $request->query('date');

        $entry = LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->whereDate('date', $date)
            ->first();

        // Check whether this date belongs to a reviewed weekly submission.
        $isReviewed = LogbookWeeklySubmission::where(
            'student_id',
            $student->student_id
        )
            ->where('status', 'reviewed')
            ->whereDate('week_start', '<=', $date)
            ->whereDate('week_end', '>=', $date)
            ->exists();

        if ($isReviewed) {
            return redirect()
                ->route('student.logbook')
                ->withErrors([
                    'week' => 'This day has already been reviewed and can no longer be edited.',
                ]);
        }

        return Inertia::render('Student/LogbookSubmission', [
            'date' => $date,
            'entry' => $entry
                ? [
                    'status' => $entry->status,
                    'description' => $entry->description,
                    'learning_outcomes' => $entry->learning_outcomes,
                    'issues' => $entry->issues,
                ]
                : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'status' => ['required', 'in:working,off,none'],
            'description' => ['nullable', 'string'],
            'learning_outcomes' => ['nullable', 'string'],
            'issues' => ['nullable', 'string'],
        ]);

        $student = $request->user()->student;

        $entryDate = $validated['date'];

        $isReviewed = LogbookWeeklySubmission::where(
            'student_id',
            $student->student_id
        )
            ->where('status', 'reviewed')
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
                ->route('student.logbook')
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
                ->route('student.logbook')
                ->with('success', 'Off Day saved successfully.');
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
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
            ->route('student.logbook')
            ->with('success', 'Daily log saved successfully.');
    }

    public function submitWeek(Request $request)
    {
        $student = $request->user()->student;

        $weekStart = $request->validate([
            'week_start' => ['required', 'date'],
        ])['week_start'];

        $weekStartDate = \Carbon\Carbon::parse($weekStart)->startOfWeek();
        $weekEndDate = $weekStartDate->copy()->endOfWeek();

        $entries = LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->whereBetween('date', [
                $weekStartDate->toDateString(),
                $weekEndDate->toDateString(),
            ])
            ->get();

        if ($entries->count() !== 7) {
            return back()->withErrors([
                'week' => 'You must complete all 7 days before submitting the week.',
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

        return back()->with(
            'success',
            'Weekly logbook submitted successfully.'
        );
    }

    public function destroy(Request $request, string $date)
    {
        $student = $request->user()->student;

        LogbookEntry::where(
            'student_id',
            $student->student_id
        )
            ->whereDate('date', $date)
            ->delete();

        return redirect()
            ->route('student.logbook')
            ->with('success', 'Daily log deleted successfully.');
    }
}