<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\PlacementQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $programmeId = $student->programme_id;

        $companies = Company::whereHas('placementQuotas', function ($query) use ($programmeId) {
            $query->available()->where('programme_id', $programmeId);
        })
            ->with(['placementQuotas' => function ($query) use ($programmeId) {
                $query->available()->where('programme_id', $programmeId);
            }])
            ->get();

        $companiesData = $companies->map(function ($company) {
            $available = $company->placementQuotas->sum(fn ($q) => $q->remaining_slots);

            return [
                'company_id' => $company->company_id,
                'company_name' => $company->company_name,
                'available' => (int) $available,
                'industry_sector' => $company->industry_sector ?? 'General',
                'office_address' => $company->office_address ?? 'Brunei Muara',
            ];
        });

        return Inertia::render('Student/Companies', [
            'companies' => $companiesData,
            'studentProgramme' => $student->programme->programme_name,
        ]);
    }

    public function show(Company $company)
    {
        $student = Auth::user()->student;
        $programmeId = $student->programme_id;

        // Load only the relevant quotas for this company AND this student's programme
        $company->load(['placementQuotas' => function ($query) use ($programmeId) {
            $query->available()->where('programme_id', $programmeId);
        }]);

        // Fetch all applications for this student at this company 
        $appliedQuotaIds = Application::where('student_id', $student->student_id)
            ->whereIn('quota_id', $company->placementQuotas->pluck('quota_id'))
            ->pluck('quota_id')
            ->toArray();

        return Inertia::render('Student/ViewCompany', [
            'company' => $company,
            'quotas' => $company->placementQuotas,
            'applied_quota_ids' => $appliedQuotaIds, 
        ]);
    }

    public function apply(Request $request, $companyId)
    {
        $student = auth()->user()->student;

        $request->validate([
            'quota_id' => 'required|exists:placement_quotas,quota_id',
        ]);

        // look for the quota requested by the user
        $quota = PlacementQuota::available()
            ->where('quota_id', $request->quota_id) // USE THE REQUESTED ID
            ->where('company_id', $companyId)       // SECURITY: Ensure quota belongs to this company
            ->where('programme_id', $student->programme_id)
            ->first();

        if (! $quota) {
            return back()->withErrors(['message' => 'This position is not available for your programme.']);
        }

        if ((float)$student->cgpa < (float)$quota->min_cgpa) {
            return back()->withErrors(['message' => "This position requires a minimum CGPA of {$quota->min_cgpa}."]);
        }

        // Check if ALREADY applied to this specific quota
        if ($student->applications()->where('quota_id', $quota->quota_id)->exists()) {
            return back()->withErrors(['message' => 'You already have an application for this position.']);
        }

        if ($quota->remaining_slots <= 0) {
            return back()->withErrors(['message' => 'This quota is already full.']);
        }

        Application::create([
            'student_id' => $student->student_id,
            'quota_id' => $quota->quota_id,
            'app_status' => 'Pending',
        ]);

        return back()->with('success', 'Application submitted!');
    }
}