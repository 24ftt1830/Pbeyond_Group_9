<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PlacementQuota;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $student = auth()->user()->student;

        // 1. Recent Applications (latest 3)
        $recentApplications = $student->applications()
            ->with(['quota.company'])
            ->latest('apply_date')
            ->take(3)
            ->get()
            ->map(fn($app) => [
                'id'         => $app->application_id,
                'company'    => $app->quota->company->company_name ?? 'Unknown',
                'status'     => $app->app_status,
                'applied_at' => $app->apply_date->format('d M Y'),
            ]);

        // 2. Recommended Companies
        // Get quotas that match student's programme, are released, approved, have available slots,
        // and the student hasn't applied to.
        $appliedQuotaIds = $student->applications()->pluck('quota_id')->toArray();

        $recommendedQuotas = PlacementQuota::with('company')
            ->where('programme_id', $student->programme_id)
            ->where('is_released', true)
            ->where('quota_status', 'Approved')
            ->whereNotIn('quota_id', $appliedQuotaIds)
            ->whereRaw('total_slots > (SELECT COUNT(*) FROM applications WHERE applications.quota_id = placement_quotas.quota_id AND applications.app_status = "Approved")')
            ->orderBy('min_cgpa')
            ->take(5)
            ->get()
            ->map(fn($quota) => [
                'id'       => $quota->company->company_id,
                'name'     => $quota->company->company_name,
                'job_title'=> $quota->job_title,
                'slots'    => $quota->total_slots - $quota->applications()->where('app_status', 'Approved')->count(),
            ]);

        // 3. Reminders
        $reminders = [];

        $pendingCount = $student->applications()->where('app_status', 'Pending')->count();
        if ($pendingCount > 0) {
            $reminders[] = "You have {$pendingCount} pending application(s). Check your tracking page for updates.";
        }

        if ($student->applications()->count() == 0) {
            $reminders[] = "You haven't applied to any company yet. Browse companies and start your internship journey!";
        }

        // Optional: add upcoming deadlines if you have a 'deadline' field on quotas
        // $upcomingDeadlines = PlacementQuota::where('deadline', '>=', now())->orderBy('deadline')->take(3)->get();
        // foreach ($upcomingDeadlines as $deadline) {
        //     $reminders[] = "Application deadline for {$deadline->company->company_name} is on " . $deadline->deadline->format('d M Y');
        // }

        return Inertia::render('Student/Dashboard', [
            'recentApplications'  => $recentApplications,
            'recommendedCompanies' => $recommendedQuotas,
            'reminders'           => $reminders,
        ]);
    }
}
