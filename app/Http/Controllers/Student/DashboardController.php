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

        return Inertia::render('Student/Dashboard', [
            'availableQuotas'  => $quotasWithStats,
            'studentProgramme' => $student->programme->programme_name,
        ]);
    }
}