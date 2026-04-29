<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;
        $quotas = $company->placementQuotas;
        $quotaIds = $quotas->pluck('quota_id');

        $totalApplications = Application::whereIn('quota_id', $quotaIds)->count();
        $pendingReviews = Application::whereIn('quota_id', $quotaIds)->where('app_status', 'Pending')->count();
        $recruitedCount = Application::whereIn('quota_id', $quotaIds)->where('app_status', 'Recruited')->count();
        $totalSlots = $quotas->sum('total_slots');

        $applications = Application::whereIn('quota_id', $quotaIds)
        ->with(['student', 'quota.company']) 
        ->orderBy('created_at', 'desc')
        ->get();

        return Inertia::render('Company/Dashboard', [
            'availableQuotas' => $quotas,
            'applications' => $applications,
            'stats' => [
                'total_applications' => $totalApplications,
                'new_applications' => 0,
                'pending_reviews' => $pendingReviews,
                'recruitment_status' => [
                    'recruited' => $recruitedCount,
                    'total' => $totalSlots,
                ],
            ],
        ]);
    }
}
