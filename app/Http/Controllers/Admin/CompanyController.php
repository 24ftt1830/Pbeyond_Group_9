<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\PlacementQuota; 
use App\Models\Application;   
use App\Models\CompanyBranch;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;
use App\Imports\CompaniesImport;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies with quota statistics and approval status.
     */
    public function index()
    {
        $companies = Company::with(['branches', 'placementQuotas.programmes.school', 'placementQuotas.applications' => function ($query) {
            $query->where('app_status', 'Recruited');
        }])->get();

        $companiesData = $companies->map(function ($company) {
            $totalQuota = $company->placementQuotas->sum('total_slots');
            
            // count applications with 'Recruited'
            $filled = $company->placementQuotas->sum(function ($quota) {
                return $quota->applications->count();
            });

            $available = $totalQuota - $filled;

            return [
                'company_id'      => $company->company_id,
                'company_name'    => $company->company_name,
                'office_address'  => $company->office_address ?? 'N/A',
                'district' => $company->district,
                'branches' => $company->branches,
                'schools' => $company->placementQuotas->flatMap(fn ($quota) => $quota->programmes->map(fn ($programme) => $programme->school?->school_name))->filter()->unique()->values(),
                'total_quota'     => (int)$totalQuota,
                'filled'          => (int)$filled,
                'available'       => (int)$available,
                'is_full'         => $available <= 0,
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

        $quotas = PlacementQuota::with(['company', 'programme'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Companies', [
            'companies' => $companiesData, 
            'stats'     => $stats,
            'quotas'    => $quotas, 
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

    /** Register a company record. HR accounts are created from Manage Users. */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name'    => 'required|string|max:150',
            'industry_sector' => 'required|string|max:100',
            'office_address'  => 'required|string',
            'district' => ['nullable', Rule::in(CompanyBranch::DISTRICTS)],
        ]);

        DB::transaction(function () use ($validated) {
        $company = Company::create([
            'company_name' => $validated['company_name'],
            'industry_sector' => $validated['industry_sector'],
            'office_address' => $validated['office_address'],
            'district' => $validated['district'] ?? null,
            'location_type' => 'Local',
            'is_approved' => true,
        ]);
        $company->branches()->create([
            'name' => 'Main Branch', 'address' => $company->office_address,
            'district' => $company->district,
        ]);
        });

        return back()->with('success', 'Company added. Create its HR account from Manage Users when ready.');
    }

    /** Import company records without creating HR accounts. */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls',
        ]);

        DB::transaction(function () use ($request) {
            Excel::import(new CompaniesImport, $request->file('file'));
        });

        return back()->with('success', 'Company records imported successfully. Create HR accounts from Manage Users when ready.');
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
