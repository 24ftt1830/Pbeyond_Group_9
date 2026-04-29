<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PlacementQuota;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $programmeId= $student->programme_id;

        // retrieve quotas where programme_id matches the student's
        $quotas = PlacementQuota::where('programme_id', $programmeId)
            ->with([
                'company:company_id,company_name,office_address',
            'applications' => function ($query) {
                $query->where('app_status', 'Recruited');
            }
            ])
            ->get();
        
        // Optional: add upcoming deadlines if you have a 'deadline' field on quotas
        // $upcomingDeadlines = PlacementQuota::where('deadline', '>=', now())->orderBy('deadline')->take(3)->get();
        // foreach ($upcomingDeadlines as $deadline) {
        //     $reminders[] = "Application deadline for {$deadline->company->company_name} is on " . $deadline->deadline->format('d M Y');
        // }

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
            'company'         => $quota->company,
        ];
    });

        return Inertia::render('Student/Dashboard', [
            'availableQuotas' => $quotasWithStats,
            'studentProgramme' => $student->programme->programme_name,
        ]);
    }
}
