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
    /**
     * Display companies that have approved/released quotas
     * matching the student's academic programme.
     */
    public function index()
    {
        $student = Auth::user()->student;
        $programmeId = $student->programme_id;

        // Filter companies that have at least one approved quota for this student's programme
        $companies = Company::whereHas('placementQuotas', function ($query) use ($programmeId) {
            $query->available()->where('programme_id', $programmeId);
        })
            ->with(['placementQuotas' => function ($query) use ($programmeId) {
                $query->available()->where('programme_id', $programmeId);
            }])
            ->get();

        $companiesData = $companies->map(function ($company) {
            // specifically for the student's programme
            $totalSlots = $company->placementQuotas->sum('total_slots');

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

    public function show($id)
    {
        $student = Auth::user()->student;
        $programmeId = $student->programme_id;

        $company = Company::with(['placementQuotas' => function ($q) use ($programmeId) {
            $q->available()->where('programme_id', $programmeId);
        }])->findOrFail($id);

        // Check if student already has a pending or approved application for this company
        $hasApplied = Application::where('student_id', $student->student_id)
            ->whereHas('quota', function ($q) use ($id) {
                $q->where('company_id', $id);
            })->exists();

        $available = $company->placementQuotas->sum(fn ($q) => $q->remaining_slots);

        $companyData = [
            'id' => $company->company_id,
            'name' => $company->company_name,
            'status' => $available > 0 ? 'Available' : 'Full',
            'quota_availability' => $available,
            'description' => $company->description,
            'location' => $company->district,
            'quotas' => $company->placementQuotas->map(fn ($q) => [
                'job_title' => $q->job_title,
                'min_cgpa' => $q->min_cgpa,
                'slots' => $q->remaining_slots,
            ]),
        ];

        return Inertia::render('Student/ViewCompany', [
            'company' => $companyData,
            'hasApplied' => $hasApplied,
        ]);
    }

    public function apply(Request $request, $companyId)
    {
        $student = auth()->user()->student;

        // Find specific quota for this company that matches the student's programme
        $quota = PlacementQuota::available()
            ->where('company_id', $companyId)
            ->where('programme_id', $student->programme_id)
            ->first();

        if (! $quota) {
            return back()->withErrors(['message' => 'No available quota for your programme at this company.']);
        }

        if ($student->applications()->where('quota_id', $quota->quota_id)->exists()) {
            return back()->withErrors(['message' => 'You already have an application for this position.']);
        }

        if ($student->cgpa < $quota->min_cgpa) {
            return back()->withErrors(['message' => "This position requires a minimum CGPA of {$quota->min_cgpa}."]);
        }

        if ($quota->remaining_slots <= 0) {
            return back()->withErrors(['message' => 'This quota is already full.']);
        }

        Application::create([
            'student_id' => $student->student_id,
            'quota_id' => $quota->quota_id,
            'app_status' => 'Pending',
            'apply_date' => now(),
        ]);

        return back()->with('success', 'Application submitted! Keep an eye on your status.');
    }
}
