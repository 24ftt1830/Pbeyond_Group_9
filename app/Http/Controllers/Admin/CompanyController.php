<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::with(['placementQuotas.applications' => function ($query) {
            $query->where('app_status', 'Approved');
        }])->get();

        $companiesData = $companies->map(function ($company) {
            $totalQuota = $company->placementQuotas->sum('total_slots');
            $filled = $company->placementQuotas->sum(function ($quota) {
                return $quota->applications->count();
            });
            $available = $totalQuota - $filled;

            return [
                'id'           => $company->company_id,
                'name'         => $company->company_name,
                'location'     => $company->office_address ?? 'N/A', // or extract district
                'total_quota'  => $totalQuota,
                'filled'       => $filled,
                'available'    => $available,
                'category'     => $company->industry_sector ?? 'General', // use industry_sector as category
            ];
        });

        // Overall stats
        $stats = [
            'total_companies' => $companies->count(),
            'total_quota'     => $companiesData->sum('total_quota'),
            'total_filled'    => $companiesData->sum('filled'),
            'available_slots' => $companiesData->sum('available'),
        ];

        return Inertia::render('Admin/Companies', [
            'companies' => $companiesData,
            'stats'     => $stats,
        ]);
    }

    // ... other methods (approve, reject, etc.)
}
