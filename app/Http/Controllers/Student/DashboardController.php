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

        // Summarize approved and released quotas without loading full company records.
        $quotas = PlacementQuota::available()
            ->select(['quota_id', 'total_slots'])
            ->withCount([
                'applications as recruited_applications_count' => function ($query) {
                    $query->where('app_status', 'Recruited');
                },
            ])
            ->get();

        $availableSlots = $quotas->sum(fn ($quota) => max(
            0,
            $quota->total_slots - $quota->recruited_applications_count,
        ));
        $openPositions = $quotas->filter(fn ($quota) =>
            $quota->total_slots - $quota->recruited_applications_count > 0
        )->count();

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
        $activeApplications = (clone $studentApplications)
            ->whereNotIn('app_status', ['Recruited', 'Declined'])
            ->count();

        $missingLogbookWeeks = app(LogbookTracking::class)->missingWeeks($student);
        $internship = $student->internship;
        $today = now()->toDateString();
        $internshipSummary = $internship ? [
            'start_date' => $internship->start_date->toDateString(),
            'end_date' => $internship->end_date->toDateString(),
            'phase' => $today < $internship->start_date->toDateString()
                ? 'upcoming'
                : ($today > $internship->end_date->toDateString() ? 'ended' : 'active'),
        ] : null;

        return Inertia::render('Student/Dashboard', [
            'recentApplications' => $applications,
            'missingLogbookWeeks' => $missingLogbookWeeks,
            'studentName' => $student->full_name ?: $request->user()->name,
            'profileComplete' => $student->isProfileComplete(),
            'cvGenerated' => !empty($student->cv_snapshot) && !empty($student->cv_generated_at),
            'internship' => $internshipSummary,
            'stats' => [
                'open_positions' => $openPositions,
                'available_slots' => $availableSlots,
                'applications' => $student->applications()->count(),
                'active_applications' => $activeApplications,
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
