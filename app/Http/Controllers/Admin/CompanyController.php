<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies with quota statistics.
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
                'id'           => $company->company_id,
                'name'         => $company->company_name,
                'location'     => $company->office_address ?? 'N/A',
                'total_quota'  => $totalQuota,
                'filled'       => $filled,
                'available'    => $available,
                'category'     => $company->industry_sector ?? 'General',
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
            'name'     => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'location' => 'required|string|max:255',
        ]);

        $company = Company::create([
            'company_name'   => $validated['name'],
            'industry_sector'=> $validated['category'],
            'office_address' => $validated['location'],
            'location_type'  => 'Local', // default; you could make it selectable
        ]);

        // Optional: Create a user account for the company? If needed, add here.

        return redirect()->route('admin.companies')->with('success', 'Company registered successfully.');
    }

    /**
     * Approve a company (if approval workflow needed).
     */
    public function approve($id)
    {
        $company = Company::findOrFail($id);
        // If you have an 'is_approved' column, update it
        $company->is_approved = true;
        $company->save();

        return redirect()->route('admin.companies')->with('success', 'Company approved.');
    }

    /**
     * Reject a company.
     */
    public function reject($id)
    {
        $company = Company::findOrFail($id);
        $company->is_approved = false;
        $company->save();

        return redirect()->route('admin.companies')->with('success', 'Company rejected.');
    }
}
