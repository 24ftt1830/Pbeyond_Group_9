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

        // Fetch all programme IDs under the student's school (e.g., SICT / School of ICT)
        $schoolProgrammeIds = \App\Models\Programme::where('school_id', $student->programme->school_id)
            ->pluck('programme_id');

        // Retrieve approved & released quotas for any programme inside the student's school
        $quotas = PlacementQuota::available()
            ->whereIn('programme_id', $schoolProgrammeIds)
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
                'company'         => $quota->company,
            ];
        });

        return Inertia::render('Student/Dashboard', [
            'availableQuotas'  => $quotasWithStats,
            'studentProgramme' => $student->programme->programme_name,
        ]);
    }
}