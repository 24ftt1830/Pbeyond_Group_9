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
        $quotas = PlacementQuota::with(['company', 'programme'])->latest()->get();
        $applications = Application::with(['student.programme', 'quota.company'])->get();

        $placements = $applications->map(function ($app) {
            return [
                'student_name' => $app->student->full_name,
                'programme'    => $app->student->programme->programme_name,
                'company_name' => $app->quota->company->company_name,
                'status'       => $this->mapStatus($app),
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

    private function mapStatus($app)
    {
        if ($app->app_status === 'Approved') {
            return ($app->quota->interview_required) ? 'Waitlisted (Interview)' : 'Approved';
        }

        return match ($app->app_status) {
            'Rejected'  => 'Rejected',
            'Reviewing' => 'Under Review',  
            default     => 'Pending',
        };
    }

    /**
     * Unified Approval: Instant Visibility
     */
    public function approve($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        
        // Approve and Release in one go
        $quota->update([
            'quota_status' => 'Approved',
            'is_released'  => true
        ]);

        return redirect()->back()->with('success', 'Quota approved and released to students.');
    }

    public function reject($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        
        $quota->update([
            'quota_status' => 'Rejected',
            'is_released'  => false 
        ]);

        return redirect()->back()->with('success', 'Quota rejected and hidden from students.');
    }

    // In case of manual approval to student view despite quota approval
    public function release($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        $quota->is_released = true;
        $quota->save();

        return redirect()->back()->with('success', 'Quota released.');
    }

    public function applications($id)
    {
        $quota = PlacementQuota::with('applications.student.user')->findOrFail($id);
        return Inertia::render('Admin/Applications', [
            'quota' => $quota
        ]);
    }
}