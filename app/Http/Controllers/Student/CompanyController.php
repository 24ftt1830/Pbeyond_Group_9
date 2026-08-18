<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\PlacementQuota;
use App\Models\Programme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies with available quotas for the student's school.
     */
    public function index()
    {
        $student = Auth::user()->student;

        // Fetch all programme IDs belonging to the student's school (e.g. SICT)
        $schoolProgrammeIds = Programme::where('school_id', $student->programme->school_id)
            ->pluck('programme_id');

        $companies = Company::whereHas('placementQuotas', function ($query) use ($schoolProgrammeIds) {
            $query->available()->whereIn('programme_id', $schoolProgrammeIds);
        })
            ->with(['placementQuotas' => function ($query) use ($schoolProgrammeIds) {
                $query->available()->whereIn('programme_id', $schoolProgrammeIds);
            }])
            ->get();

        $companiesData = $companies->map(function ($company) {
            $available = $company->placementQuotas->sum(fn ($q) => $q->remaining_slots);

            return [
                'company_id'      => $company->company_id,
                'company_name'    => $company->company_name,
                'available'       => (int) $available,
                'industry_sector' => $company->industry_sector ?? 'General',
                'office_address'  => $company->office_address ?? 'Brunei Muara',
            ];
        });

        return Inertia::render('Student/Companies', [
            'companies'        => $companiesData,
            'studentProgramme' => $student->programme->programme_name,
        ]);
    }

    /**
     * Display specific company details and available positions.
     */
    public function show($id)
    {
        $student = Auth::user()->student;

        // Fetch programme IDs for student's school
        $schoolProgrammeIds = Programme::where('school_id', $student->programme->school_id)
            ->pluck('programme_id');

        // Fetch company
        $company = Company::findOrFail($id);

        // Fetch positions/quotas available for this school
        $quotas = PlacementQuota::available()
            ->where('company_id', $id)
            ->whereIn('programme_id', $schoolProgrammeIds)
            ->get();

        // Fetch IDs of all quotas the student has already applied to
        $appliedQuotaIds = $student->applications()
            ->pluck('quota_id')
            ->toArray();

        return Inertia::render('Student/ViewCompany', [
            'company'           => $company,
            'quotas'            => $quotas,
            'applied_quota_ids' => $appliedQuotaIds,
        ]);
    }

    /**
     * Handle application submission for a quota position.
     */
    public function apply(Request $request, $companyId)
    {
        $student = Auth::user()->student;

        $schoolProgrammeIds = Programme::where('school_id', $student->programme->school_id)
            ->pluck('programme_id');

        $request->validate([
            'quota_id' => 'required|exists:placement_quotas,quota_id',
        ]);

        // Enforce the 3 choices maximum limit globally across all companies/quotas
        if ($student->applications()->count() >= 3) {
            return back()->withErrors(['message' => 'You have reached the maximum limit of 3 application choices.']);
        }

        $quota = PlacementQuota::available()
            ->where('quota_id', $request->quota_id) 
            ->where('company_id', $companyId)       
            ->whereIn('programme_id', $schoolProgrammeIds)
            ->first();

        if (! $quota) {
            return back()->withErrors(['message' => 'This position is not available for your school.']);
        }

        if ((float)$student->cgpa < (float)$quota->min_cgpa) {
            return back()->withErrors(['message' => "This position requires a minimum CGPA of {$quota->min_cgpa}."]);
        }

        if ($student->applications()->where('quota_id', $quota->quota_id)->exists()) {
            return back()->withErrors(['message' => 'You have already applied for this position.']);
        }

        if ($quota->remaining_slots <= 0) {
            return back()->withErrors(['message' => 'This quota is already full.']);
        }

        Application::create([
            'student_id' => $student->student_id,
            'quota_id'   => $quota->quota_id,
            'app_status' => 'Pending',
        ]);

        return back()->with('success', 'Application submitted!');
    }
}