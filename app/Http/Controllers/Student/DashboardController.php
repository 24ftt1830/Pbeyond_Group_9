<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PlacementQuota;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $request->user()->student;

        // Get the student's exact programme (course) ID
        $programmeId = $student->programme_id;

        // Retrieve approved & released quotas strictly linked to the student's exact course
        $quotas = PlacementQuota::available()
            ->whereHas('programmes', function ($query) use ($programmeId) {
                $query->where('programmes.programme_id', $programmeId);
            })
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
                'quota_id'        => $quota->quota_id,
                'position_title'  => $quota->job_title,
                'total_slots'     => $quota->total_slots,
                'filled'          => $filled,
                'available'       => max(0, $available), 
                'is_full'         => $available <= 0,
                'company'         => [
                    'company_id'     => $quota->company->company_id,
                    'company_name'   => $quota->company->company_name,
                    'office_address' => $quota->company->office_address ?? 'Brunei Muara',
                ],
            ];
        });

        $completedOnboardingTasks = $student?->completed_onboarding_tasks ?? [];

        return Inertia::render('Student/Dashboard', [
            'availableQuotas'          => $quotasWithStats,
            'studentProgramme'         => $student->programme->programme_name,
            'completedOnboardingTasks' => $completedOnboardingTasks,
        ]);
    }

    public function completeOnboarding(Request $request)
    {
        $request->validate([
            'task' => ['required', 'string'],
        ]);

        $student = $request->user()->student;

        if ($student) {
            $tasks = $student->completed_onboarding_tasks ?? [];

            if (!in_array($request->task, $tasks)) {
                $tasks[] = $request->task;
                $student->completed_onboarding_tasks = $tasks;
                $student->save();
            }
        }

        return back();
    }
}