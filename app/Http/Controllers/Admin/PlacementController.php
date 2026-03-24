<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\PlacementQuota;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlacementController extends Controller
{
    public function index()
    {
        // Fetch all applications with related student and quota/company
        $applications = Application::with(['student.programme', 'quota.company'])->get();

        // Map to the structure expected by the frontend
        $placements = $applications->map(function ($app) {
            return [
                'student_name' => $app->student->full_name,
                'programme'    => $app->student->programme->programme_name,
                'company_name' => $app->quota->company->company_name,
                'status'       => $this->mapStatus($app->app_status),
            ];
        });

        // Calculate statistics for the dashboard cards
        $stats = [
            'total_students' => Student::count(),
            'total_applied'  => Application::count(),
            'total_approved' => Application::where('app_status', 'Approved')->count(),
            'pending_review' => Application::where('app_status', 'Pending')->count(),
        ];

        return Inertia::render('Admin/Placements', [
            'placements' => $placements,
            'stats'      => $stats,
        ]);
    }

    // Helper to map internal status to the string used in the frontend
    private function mapStatus($status)
    {
        return match ($status) {
            'Approved'  => 'Approved',
            'Rejected'  => 'Rejected',
            'Reviewing' => 'Pending',  // frontend uses "Pending" for under review
            default     => 'Pending',
        };
    }

    // The following methods remain unchanged – they work on placement quotas
    public function approve($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        $quota->quota_status = 'Approved';
        $quota->save();

        return redirect()->route('admin.placements')->with('success', 'Quota approved.');
    }

    public function reject($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        $quota->quota_status = 'Rejected';
        $quota->save();

        return redirect()->route('admin.placements')->with('success', 'Quota rejected.');
    }

    public function release($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        $quota->is_released = true;
        $quota->save();

        return redirect()->route('admin.placements')->with('success', 'Quota released.');
    }

    public function applications($id)
    {
        $quota = PlacementQuota::with('applications.student')->findOrFail($id);
        return Inertia::render('Admin/Applications', ['quota' => $quota]);
    }
}
