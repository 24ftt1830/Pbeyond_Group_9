<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
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
        $newApplications = Application::whereIn('quota_id', $quotaIds)->where('created_at', '>=', now()->subDays(7))->count();
        $pendingReviews = Application::whereIn('quota_id', $quotaIds)->where('app_status', 'Pending')->count();
        $recruitedCount = Application::whereIn('quota_id', $quotaIds)->where('app_status', 'Recruited')->count();
        $totalSlots = $quotas->sum('total_slots');

        $applications = Application::whereIn('quota_id', $quotaIds)
            ->with(['student', 'quota.company']) 
            ->orderBy('created_at', 'desc')
            ->get();

        $completedTasks = $company->completed_onboarding_tasks ?? [];

        return Inertia::render('Company/Dashboard', [
            'availableQuotas' => $quotas,
            'applications' => $applications,
            'completedOnboardingTasks' => $completedTasks,
            'stats' => [
                'total_applications' => $totalApplications,
                'new_applications' => $newApplications,
                'pending_reviews' => $pendingReviews,
                'recruitment_status' => [
                    'recruited' => $recruitedCount,
                    'total' => $totalSlots,
                ],
            ],
        ]);
    }

    public function completeOnboarding(Request $request)
    {
        $request->validate([
            'task' => ['required', 'string'],
        ]);

        $company = Auth::user()->company;
        $completed = $company->completed_onboarding_tasks ?? [];

        if (!in_array($request->task, $completed)) {
            $completed[] = $request->task;
            $company->update(['completed_onboarding_tasks' => $completed]);
        }

        return back()->with('success', 'Onboarding task marked as completed.');
    }
}