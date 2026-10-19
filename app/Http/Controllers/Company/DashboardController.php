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
        $companyId = $company?->company_id;
        $quotas = $company
            ? $company->placementQuotas()->latest()->get()
            : collect();
        $quotaIds = $quotas->pluck('quota_id');

        $totalApplications = Application::whereIn('quota_id', $quotaIds)->count();
        $newApplications = Application::whereIn('quota_id', $quotaIds)->where('created_at', '>=', now()->subDays(7))->count();
        $pendingReviews = Application::whereIn('quota_id', $quotaIds)->where('app_status', 'Pending')->count();
        $recruitedCount = Application::whereIn('quota_id', $quotaIds)->where('app_status', 'Recruited')->count();
        $totalSlots = $quotas->sum('total_slots');

        $applications = Application::whereIn('quota_id', $quotaIds)
            ->with(['student', 'quota'])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        $completedTasks = $company?->completed_onboarding_tasks ?? [];

        $quotaOverview = $quotas->map(fn ($quota) => [
            'quota_id' => $quota->quota_id,
            'job_title' => $quota->job_title,
            'total_slots' => $quota->total_slots,
            'quota_status' => $quota->quota_status,
            'is_released' => $quota->is_released,
            'application_count' => $quota->applications()->count(),
        ]);

        $internSetupQueue = Application::query()
            ->whereIn('quota_id', $quotaIds)
            ->where('app_status', 'Recruited')
            ->with([
                'student.programme',
                'student.internship',
                'student.supervisorAssignments' => fn ($query) => $query->whereHas(
                    'supervisor',
                    fn ($supervisor) => $supervisor->where('company_id', $companyId)
                ),
            ])
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy('student_id')
            ->map(function ($applications) {
                $application = $applications->first();
                $student = $application->student;

                if (!$student) {
                    return null;
                }

                $needsDates = !$student->internship?->start_date || !$student->internship?->end_date;
                $needsSupervisor = $student->supervisorAssignments->isEmpty();

                if (!$needsDates && !$needsSupervisor) {
                    return null;
                }

                return [
                    'student_id' => $student->student_id,
                    'full_name' => $student->full_name ?? 'Student',
                    'student_code' => $student->pb_student_code,
                    'positions' => $applications
                        ->map(fn ($item) => $item->quota?->job_title)
                        ->filter()
                        ->unique()
                        ->values(),
                    'needs_dates' => $needsDates,
                    'needs_supervisor' => $needsSupervisor,
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Company/Dashboard', [
            'quotas' => $quotaOverview,
            'applications' => $applications,
            'internSetupQueue' => $internSetupQueue,
            'completedOnboardingTasks' => $completedTasks,
            'stats' => [
                'total_applications' => $totalApplications,
                'new_applications' => $newApplications,
                'pending_reviews' => $pendingReviews,
                'total_quotas' => $quotas->count(),
                'open_quotas' => $quotas->where('quota_status', 'Approved')->where('is_released', true)->count(),
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
