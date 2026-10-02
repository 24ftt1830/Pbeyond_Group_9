<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\Internship;
use App\Models\LogbookWeeklySubmission;
use App\Models\PlacementQuota;
use App\Models\Student;
use App\Models\AcademicSupervisorAssignment;
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

        $currentStudents = Student::query()
            ->whereHas('internship', function ($query) {
                $query
                    ->whereDate('start_date', '<=', now())
                    ->whereDate('end_date', '>=', now());
            })
            ->when($selectedSemester, function ($query) use ($selectedSemester) {
                $query->where('current_semester', $selectedSemester);
            });

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
        $totalStudents = (clone $currentStudents)->count();

        /*
         * Students with a recruited internship application
         */
        $placedStudents = (clone $currentStudents)
            ->whereHas('applications', function ($query) {
                $query->where('app_status', 'Recruited');
            })
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
        * A logbook is expected for each Monday-starting week
        * from the internship start date through the current week.
        */
        $missingLogbooks = 0;

        $activeInternships = Internship::query()
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->get();

        foreach ($activeInternships as $internship) {
            $weekStart = $internship->start_date->copy()->startOfWeek();
            $currentWeekStart = now()->startOfWeek();

            while ($weekStart->lte($currentWeekStart)) {
                $exists = LogbookWeeklySubmission::where(
                    'student_id',
                    $internship->student_id
                )
                    ->whereDate('week_start', $weekStart)
                    ->exists();

                if (!$exists) {
                    $missingLogbooks++;
                }

                $weekStart->addWeek();
            }
        }

        /*
        * Students approaching internship completion.
        *
        * An internship is considered approaching completion
        * when its end date is within the next 4 weeks.
        */
        $approachingCompletion = Internship::query()
            ->whereDate('end_date', '>', now())
            ->whereDate('end_date', '<=', now()->addWeeks(4))
            ->count();

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

        $requiringIntervention = AcademicSupervisorAssignment::whereIn(
            'monitoring_status',
            ['Needs Attention', 'At Risk']
        )->count();

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
                'missing_logbooks' => $missingLogbooks,
                'approaching_completion' => $approachingCompletion,
                'requiring_intervention' => $requiringIntervention,
            ],
            'availableSemesters' => $availableSemesters,
            'selectedSemester' => $selectedSemester,
            'activities' => $activities,
        ]);
    }
}