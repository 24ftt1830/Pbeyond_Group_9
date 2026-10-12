<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\LogbookWeeklySubmission;
use App\Models\PlacementQuota;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        /*
        * Students currently on an active internship.
        */
        $selectedSemester = $request->integer('semester');
        $today = now()->startOfDay();

        $currentStudents = Student::query()
            ->whereHas('internship', function ($query) {
                $query
                    ->whereDate('start_date', '<=', now())
                    ->whereDate('end_date', '>=', now());
            })
            ->when($selectedSemester, function ($query) use ($selectedSemester) {
                $query->where('current_semester', $selectedSemester);
            });

        $currentInternshipStudents = (clone $currentStudents)
            ->with([
                'internship',
                'programme.academicSupervisorAssignments',
                'applications' => fn ($query) => $query
                    ->where('app_status', 'Recruited')
                    ->orderByDesc('updated_at')
                    ->with('quota.company'),
            ])
            ->orderBy('full_name')
            ->get();

        $formatProgressStudent = function ($student) {
            $internship = $student->internship;
            $recruitedApplication = $student->applications->first();

            return [
                'student_id' => $student->student_id,
                'student_code' => $student->pb_student_code,
                'full_name' => $student->full_name,
                'programme_name' => $student->programme?->programme_name,
                'company_name' => $recruitedApplication?->quota?->company?->company_name,
                'start_date' => $internship?->start_date?->toDateString(),
                'end_date' => $internship?->end_date?->toDateString(),
            ];
        };

        /*
         * Pending companies
         */
        $pendingCompanies = Company::where(
            'is_approved',
            false
        )->count();

        /*
         * Pending quota requests
         */
        $pendingQuotas = PlacementQuota::where(
            'quota_status',
            'Pending'
        )->count();

        /*
         * Current internship students
         */
        $totalStudents = $currentInternshipStudents->count();

        /*
         * Students with a recruited internship application
         */
        $placedStudents = $currentInternshipStudents
            ->filter(fn ($student) => $student->applications->isNotEmpty())
            ->count();

        /*
         * Current students without a recruited placement
         */
        $unplacedStudents = max(
            $totalStudents - $placedStudents,
            0
        );
        /*
        * Missing weekly logbooks
        *
        * Count students with at least one missing submission for a
        * completed Monday-to-Sunday week. The current week is excluded
        * because students still have time to complete it.
        */
        $lastCompletedWeekStart = $today->copy()->startOfWeek()->subWeek();
        $submittedWeekKeys = LogbookWeeklySubmission::query()
            ->whereIn('student_id', $currentInternshipStudents->pluck('student_id'))
            ->whereDate('week_start', '<=', $lastCompletedWeekStart->toDateString())
            ->get(['student_id', 'week_start'])
            ->mapWithKeys(fn ($submission) => [
                $submission->student_id . '|' . $submission->week_start->toDateString() => true,
            ]);

        $missingLogbookStudents = $currentInternshipStudents
            ->map(function ($student) use ($lastCompletedWeekStart, $submittedWeekKeys, $formatProgressStudent) {
                $internship = $student->internship;
                $weekStart = $internship->start_date->copy()->startOfWeek();
                $missingWeeks = [];

                while (
                    $weekStart->lte($lastCompletedWeekStart)
                    && $weekStart->lte($internship->end_date)
                ) {
                    $weekKey = $student->student_id . '|' . $weekStart->toDateString();

                    if (!$submittedWeekKeys->has($weekKey)) {
                        $missingWeeks[] = $weekStart->toDateString();
                    }

                    $weekStart->addWeek();
                }

                if ($missingWeeks === []) {
                    return null;
                }

                return array_merge($formatProgressStudent($student), [
                    'missing_weeks' => count($missingWeeks),
                    'oldest_missing_week' => $missingWeeks[0],
                ]);
            })
            ->filter()
            ->sortByDesc('missing_weeks')
            ->values();

        $missingLogbookWeeks = $missingLogbookStudents->sum('missing_weeks');

        /*
        * Students approaching internship completion.
        *
        * An internship is considered approaching completion
        * when its end date is within the next 4 weeks.
        */
        $approachingCompletionStudents = $currentInternshipStudents
            ->filter(fn ($student) => $student->internship->end_date->toDateString() <= $today->copy()->addWeeks(4)->toDateString())
            ->map($formatProgressStudent)
            ->sortBy('end_date')
            ->values();

        /*
         * Weekly logbook status counts
         *
         * These counts are system-wide and are not filtered
         * by the selected semester.
         */
        $weeklyLogbooksAwaitingReview = LogbookWeeklySubmission::whereIn(
            'status',
            ['submitted', 'pending']
        )->count();

        $weeklyLogbooksApproved = LogbookWeeklySubmission::where(
            'status',
            'approved'
        )->count();

        $weeklyLogbooksNeedingFixes = LogbookWeeklySubmission::where(
            'status',
            'pending_fix'
        )->count();

        /*
         * Available internship quota slots
         *
         * Uses the existing PlacementQuota::available() scope,
         * which means the quota must be Approved and Released.
         */
        $availableQuotas = PlacementQuota::available()
            ->get()
            ->sum(function ($quota) {
                return $quota->remaining_slots;
            });

        /*
         * Placement percentage
         */
        $placementRate = $totalStudents > 0
            ? round(($placedStudents / $totalStudents) * 100)
            : 0;

        /*
         * Semester options currently represented by students.
         *
         * Historical semesters with no current students will not
         * appear in the active dashboard filter.
         */
        $availableSemesters = Student::query()
            ->where('current_semester', '>', 1)
            ->select('current_semester')
            ->distinct()
            ->orderBy('current_semester')
            ->pluck('current_semester');

        /*
         * Recent application activity
         */
        $activities = Application::query()
            ->with([
                'student',
                'quota.company',
            ])
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($application) {
                $nameParts = preg_split(
                    '/\s+/',
                    trim($application->student?->full_name ?? '')
                );

                $initials = collect($nameParts)
                    ->filter()
                    ->take(2)
                    ->map(function ($name) {
                        return strtoupper(substr($name, 0, 1));
                    })
                    ->implode('');

                return [
                    'id' => $application->id,
                    'initials' => $initials,
                    'student_name' => $application->student?->full_name
                        ?? 'Unknown Student',
                    'company_name' => $application->quota?->company?->company_name
                        ?? 'Unknown Company',
                    'status' => $application->app_status,
                    'date' => $application->updated_at?->diffForHumans(),
                ];
            });

        $interventionStudents = $currentInternshipStudents
            ->map(function ($student) use ($formatProgressStudent) {
                $statuses = $student->programme?->academicSupervisorAssignments
                    ->pluck('monitoring_status') ?? collect();

                if (!$statuses->contains(fn ($status) => in_array($status, ['Needs Attention', 'At Risk'], true))) {
                    return null;
                }

                return array_merge($formatProgressStudent($student), [
                    'monitoring_status' => $statuses->contains('At Risk') ? 'At Risk' : 'Needs Attention',
                ]);
            })
            ->filter()
            ->sortBy(fn ($student) => $student['monitoring_status'] === 'At Risk' ? 0 : 1)
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending_companies' => $pendingCompanies,
                'pending_quotas' => $pendingQuotas,
                'total_students' => $totalStudents,
                'unplaced_students' => $unplacedStudents,
                'accepted_students' => $placedStudents,
                'available_quotas' => $availableQuotas,
                'placement_rate' => $placementRate,
                'weekly_logbooks_awaiting_review' => $weeklyLogbooksAwaitingReview,
                'weekly_logbooks_approved' => $weeklyLogbooksApproved,
                'weekly_logbooks_needing_fixes' => $weeklyLogbooksNeedingFixes,
                'missing_logbooks' => $missingLogbookStudents->count(),
                'missing_logbook_weeks' => $missingLogbookWeeks,
                'approaching_completion' => $approachingCompletionStudents->count(),
                'requiring_intervention' => $interventionStudents->count(),
            ],
            'progress' => [
                'current_internships' => $currentInternshipStudents
                    ->map($formatProgressStudent)
                    ->values(),
                'missing_logbooks' => $missingLogbookStudents,
                'approaching_completion' => $approachingCompletionStudents,
                'requiring_intervention' => $interventionStudents,
            ],
            'availableSemesters' => $availableSemesters,
            'selectedSemester' => $selectedSemester,
            'activities' => $activities,
        ]);
    }
}
