<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies with quota statistics and approval status.
     */
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
                'company_id'      => $company->company_id,
                'company_name'    => $company->company_name,
                'office_address'  => $company->office_address ?? 'N/A',
                'total_quota'     => (int)$totalQuota,
                'filled'          => (int)$filled,
                'available'       => (int)$available,
                'industry_sector' => $company->industry_sector ?? 'General',
                'is_approved'     => (bool)$company->is_approved,
            ];
        });

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

    /**
     * Store a newly created company.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name'    => 'required|string|max:255',
            'industry_sector' => 'required|string',
            'office_address'  => 'required|string',
        ]);

        // The 'is_approved' column defaults to false via migration
        Company::create($validated);

        return back()->with('success', 'Company registered successfully.');
    }

    /**
     * Approve a company (sets is_approved to true).
     */
    public function approve($id)
    {
        $company = Company::findOrFail($id);
        $company->update(['is_approved' => true]);

        return back()->with('success', 'Company approved.');
    }

    /**
     * Reject a company (sets is_approved to false).
     */
    public function reject($id)
    {
        $company = Company::findOrFail($id);
        $company->update(['is_approved' => false]);

        return back()->with('success', 'Company rejected.');
    }
}
