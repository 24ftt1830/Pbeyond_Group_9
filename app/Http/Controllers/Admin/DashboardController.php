<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Student;
use App\Models\Application;
use App\Models\PlacementQuota;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Data for the Donut Chart
        $chartData = [
            ['name' => 'Accepted', 'value' => Application::where('app_status', 'Accepted')->count(), 'color' => '#10b981'],
            ['name' => 'Rejected', 'value' => Application::where('app_status', 'Rejected')->count(), 'color' => '#ef4444'],
            ['name' => 'Pending',  'value' => Application::where('app_status', 'Pending')->count(), 'color' => '#f59e0b'],
        ];

        // 2. High-level Statistics
        $stats = [
            'pending_companies' => Company::where('is_approved', false)->count(),
            'pending_quotas'    => PlacementQuota::where('quota_status', 'Pending')->count(),
            'total_students'    => Student::count(),
            'unplaced_students' => Student::whereDoesntHave('applications', function($q) {
                $q->where('app_status', 'Accepted');
            })->count(),
        ];

        // 3. Activity Feed (Using whereHas to ensure we only get valid Student/User links)
        $activities = Application::whereHas('student.user')
            ->with(['student.user', 'quota.company'])
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get()
            ->map(function ($app) {
                // Accessing 'username' from your User model
                $name = $app->student->user->username ?? 'Unknown Student';

                return [
                    'id' => $app->application_id,
                    'status' => $app->app_status,
                    'date' => $app->created_at ? Carbon::parse($app->created_at)->diffForHumans() : 'Recently',
                    'student_name' => $name,
                    'company_name' => $app->quota->company->company_name ?? 'N/A',
                    'initials' => strtoupper(substr($name, 0, 2)),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'activities' => $activities,
        ]);
    }
}
