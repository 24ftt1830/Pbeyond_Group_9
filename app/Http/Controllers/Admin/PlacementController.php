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
        // 1. Get ALL Company Quota Requests (Pending, Approved, Rejected)
        $quotas = PlacementQuota::with(['company', 'programme'])->latest()->get();

        // 2. Get Student Applications for placement table
        $applications = Application::with(['student.programme', 'quota.company'])->get();

        $placements = $applications->map(function ($app) {
            return [
                'student_name' => $app->student->full_name,
                'programme'    => $app->student->programme->programme_name,
                'company_name' => $app->quota->company->company_name,
                'status'       => $this->mapStatus($app->app_status),
            ];
        });

        $stats = [
            'total_students' => Student::count(),
            'total_applied'  => Application::count(),
            'total_approved' => Application::where('app_status', 'Approved')->count(),
            'pending_review' => Application::where('app_status', 'Pending')->count(),
            'pending_quotas' => PlacementQuota::where('quota_status', 'Pending')->count(),
        ];

        return Inertia::render('Admin/Placements', [
            'placements' => $placements,
            'quotas'     => $quotas, 
            'stats'      => $stats,
        ]);
    }

    private function mapStatus($status)
    {
        return match ($status) {
            'Approved'  => 'Approved',
            'Rejected'  => 'Rejected',
            'Reviewing' => 'Pending',  
            default     => 'Pending',
        };
    }

    public function approve($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        $quota->quota_status = 'Approved';
        $quota->save();

        return redirect()->back()->with('success', 'Quota approved successfully.');
    }

    public function reject($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        $quota->quota_status = 'Rejected';
        $quota->save();

        return redirect()->back()->with('success', 'Quota rejected.');
    }

    public function release($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        $quota->is_released = true;
        $quota->save();

        return redirect()->back()->with('success', 'Quota released to students.');
    }

    public function applications($id)
    {
        $quota = PlacementQuota::with('applications.student')->findOrFail($id);
        return Inertia::render('Admin/Applications', [
            'quota' => $quota
        ]);
    }
}