<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\PlacementQuota;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        /*
         * Students currently in an active internship semester.
         *
         * For now, students with a current semester greater than 1
         * are considered part of the current internship population.
         */
       $selectedSemester = $request->integer('semester');

        $currentStudents = Student::query()
            ->where('current_semester', '>', 1)
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
         * Students with an approved internship application
         */
        $placedStudents = (clone $currentStudents)
    ->whereHas('applications', function ($query) {
        $query->where('app_status', 'Recruited');
    })
    ->count();

        /*
         * Current students without an approved placement
         */
        $unplacedStudents = max(
            $totalStudents - $placedStudents,
            0
        );

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

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending_companies' => $pendingCompanies,
                'pending_quotas' => $pendingQuotas,
                'total_students' => $totalStudents,
                'unplaced_students' => $unplacedStudents,
                'accepted_students' => $placedStudents,
                'available_quotas' => $availableQuotas,
                'placement_rate' => $placementRate,
            ],

            'availableSemesters' => $availableSemesters,

            'selectedSemester' => $selectedSemester,

            'activities' => $activities,
        ]);
    }
}