<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PlacementQuota;
use App\Services\LogbookTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        // Students from every programme can browse all approved and released quotas.
        $quotas = PlacementQuota::available()
            ->with([
                'company:company_id,company_name,office_address',
                'applications' => function ($query) {
                    $query->where('app_status', 'Recruited');
                }
            ])
            ->get();

        $quotasWithStats = $quotas->map(function ($quota) {
            $filled = $quota->applications->count();
            $available = $quota->total_slots - $filled;

            return [
                'quota_id'       => $quota->quota_id,
                'position_title' => $quota->job_title,
                'total_slots'    => $quota->total_slots,
                'filled'         => $filled,
                'available'      => max(0, $available),
                'is_full'        => $available <= 0,
                'company'        => [
                    'company_id'     => $quota->company->company_id,
                    'company_name'   => $quota->company->company_name,
                    'office_address' => $quota->company->office_address ?? 'Brunei Muara',
                ],
            ];
        });

        $applications = $student->applications()
            ->with('quota.company')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn ($application) => [
                'id' => $application->id,
                'app_status' => $application->app_status,
                'created_at' => $application->created_at,
                'job_title' => $application->quota?->job_title,
                'company_name' => $application->quota?->company?->company_name,
            ]);

        $studentApplications = $student->applications();
        $recruitedApplications = (clone $studentApplications)
            ->where('app_status', 'Recruited')
            ->count();

        $completedOnboardingTasks = $student?->completed_onboarding_tasks ?? [];
        $missingLogbookWeeks = app(LogbookTracking::class)->missingWeeks($student);

        return Inertia::render('Student/Dashboard', [
            'availableQuotas'          => $quotasWithStats,
            'completedOnboardingTasks' => $student->completed_onboarding_tasks ?? [],
            'recentApplications' => $applications,
            'missingLogbookWeeks' => $missingLogbookWeeks,
            'stats' => [
                'open_positions' => $quotasWithStats->where('is_full', false)->count(),
                'available_slots' => $quotasWithStats->sum('available'),
                'applications' => $student->applications()->count(),
                'pending_applications' => (clone $studentApplications)->where('app_status', 'Pending')->count(),
                'recruited_applications' => $recruitedApplications,
            ],
        ]);
    }

    public function completeOnboarding(Request $request)
    {
        $request->validate([
            'task' => ['required', 'string'],
        ]);

            $student = Auth::user()->student;

            $completedTasks = $student->completed_onboarding_tasks ?? [];

            // Prevent duplicate entries
            if (!in_array($request->task, $completedTasks, true)) {
                $completedTasks[] = $request->task;

                $student->completed_onboarding_tasks = $completedTasks;
                $student->save();
            }

            return back()->with(
                'success',
                'Onboarding task marked as completed.'
            );
    }
}
