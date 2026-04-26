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
        $quotas = PlacementQuota::with(['company', 'programme'])
        ->withCount(['applications as filled_count' => function ($query) {
            $query->where('app_status', 'Recruited');
        }])
        ->latest()
        ->get();

        $applications = Application::with(['student.programme', 'quota.company'])->get();

        $placements = $applications->map(function ($app) {
            return [
                'student_name' => $app->student->full_name,
                'programme'    => $app->student->programme->programme_name,
                'company_name' => $app->quota->company->company_name,
                'status'       => $app->app_status, 
            ];
        });

        $processedCompanies = $quotas->map(function ($quota) {
        return [
            'company_id'      => $quota->quota_id, // Match your database primary key
            'company_name'    => $quota->company->company_name ?? 'N/A',
            'office_address'  => $quota->company->office_address ?? 'N/A',
            'industry_sector' => $quota->company->industry_sector ?? 'N/A',
            'total_quota'     => $quota->total_slots, // Ensure this column name matches your DB
            'filled'          => $quota->filled_count, // The result of withCount
            'available'       => $quota->total_slots - $quota->filled_count,
            'status'          => $quota->quota_status,
        ];
    });

        $stats = [
        'total_students' => Student::count(),
        'total_applied'  => Application::count(),
        'total_filled'   => Application::where('app_status', 'Recruited')->count(),
        'pending_review' => Application::where('app_status', 'Pending')->count(),
        'pending_quotas' => PlacementQuota::where('quota_status', 'Pending')->count(),
    ];

        return Inertia::render('Admin/Placements', [
            'placements' => $placements,
            'quotas'     => $quotas, 
            'stats'      => $stats,
            'processedCompanies' => $processedCompanies,
        ]);
    }

    /**
     * Unified Approval: Instant Visibility
     */
    public function approve($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        
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