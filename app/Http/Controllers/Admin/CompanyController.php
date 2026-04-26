<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\PlacementQuota; 
use App\Models\Application;   
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
            'stats'              => $stats,
        ]);
    }

    public function toggleRelease($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        
        $quota->update([
            'quota_status' => 'Approved',
            'is_released' => !$quota->is_released
        ]);

        $status = $quota->is_released ? 'released to students' : 'hidden from students';

        return back()->with('success', "Quota is now {$status}.");
    }

    public function apply(Request $request, $companyId)
    {
        $student = auth()->user()->student;

        if ($student->vetting_status !== 'Approved') {
            return back()->withErrors('Your profile has not been approved yet.');
        }

        $quota = $student->programme->placementQuotas()
            ->where('company_id', $companyId)
            ->where('is_released', true)
            ->where('quota_status', 'Approved')
            ->first();

        if (!$quota) {
            return back()->withErrors('No available quota for this company.');
        }

        if ($student->applications()->where('quota_id', $quota->quota_id)->exists()) {
            return back()->withErrors('You have already applied for this company.');
        }

        if ($quota->min_cgpa > $student->cgpa) {
            return back()->withErrors('Your CGPA does not meet the requirement.');
        }

        $approvedCount = $quota->applications()->where('app_status', 'Approved')->count();
        if ($approvedCount >= $quota->total_slots) {
            return back()->withErrors('No slots left for this company.');
        }

        Application::create([
            'student_id' => $student->student_id,
            'quota_id'   => $quota->quota_id,
            'app_status' => 'Pending_ILD',
            'apply_date' => now(),
        ]);

        return back()->with('success', 'Application submitted successfully. It will be reviewed by ILD.');
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