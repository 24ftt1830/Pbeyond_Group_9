<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {


        $companies = Company::with(['placementQuotas' => function ($q) {
            $q->where('is_released', true)
              ->where('quota_status', 'Approved');
        }])->get();

        $companiesData = $companies->map(function ($company) {
            $totalSlots = $company->placementQuotas->sum('total_slots');
            $filledSlots = $company->placementQuotas->sum(function ($quota) {
                return $quota->applications()->where('app_status', 'Approved')->count();
            });
            $available = $totalSlots - $filledSlots;

            // Use actual columns if you added them to companies table
            return [
                'id'                  => $company->company_id,
                'name'                => $company->company_name,
                'status'              => $available > 0 ? 'Available' : 'Full',
                'quota_availability'  => $available,
                'interview_required'  => $company->interview_required ?? 'Depending on the course',
                'school'              => $company->school ?? 'SICT',
                'district'            => $company->district ?? 'Brunei-Muara',
            ];
        });

        return Inertia::render('Student/Companies', [
            'companies' => $companiesData,
        ]);
    }

    public function show($id)
    {
        $company = Company::with(['placementQuotas' => function ($q) {
            $q->where('is_released', true)
              ->where('quota_status', 'Approved');
        }])->findOrFail($id);

        $totalSlots = $company->placementQuotas->sum('total_slots');
        $filledSlots = $company->placementQuotas->sum(function ($quota) {
            return $quota->applications()->where('app_status', 'Approved')->count();
        });
        $available = $totalSlots - $filledSlots;

        $hasApplied = auth()->user()->student->applications()
            ->whereHas('quota', fn($q) => $q->where('company_id', $company->company_id))
            ->exists();

        $companyData = [
            'id'                    => $company->company_id,
            'name'                  => $company->company_name,
            'status'                => $available > 0 ? 'Available' : 'Full',
            'quota_availability'    => $available,
            'interview_required'    => $company->interview_required ?? 'Depending on the course',
            'school'                => $company->school ?? 'SICT',
            'district'              => $company->district ?? 'Brunei-Muara',
            'description'           => $company->description ?? null,
            'additional_information'=> $company->additional_info ?? null,
        ];

        return Inertia::render('Student/ViewCompany', [
            'company'    => $companyData,
            'hasApplied' => $hasApplied,
        ]);
    }

    public function apply(Request $request, $companyId)
    {
        $student = auth()->user()->student;

        // Find a suitable quota for this student's programme
        $quota = $student->programme->placementQuotas()
            ->where('company_id', $companyId)
            ->where('is_released', true)
            ->where('quota_status', 'Approved')
            ->first();

        if (!$quota) {
            return back()->withErrors('No available quota for this company.');
        }

        // Check if already applied
        if ($student->applications()->where('quota_id', $quota->quota_id)->exists()) {
            return back()->withErrors('You have already applied for this company.');
        }

        // CGPA check
        if ($quota->min_cgpa > $student->cgpa) {
            return back()->withErrors('Your CGPA does not meet the requirement.');
        }

        // Check slots availability
        $approvedCount = $quota->applications()->where('app_status', 'Approved')->count();
        if ($approvedCount >= $quota->total_slots) {
            return back()->withErrors('No slots left for this company.');
        }

        // Create application
        Application::create([
            'student_id' => $student->student_id,
            'quota_id'   => $quota->quota_id,
            'app_status' => 'Pending',
            'apply_date' => now(),
        ]);

        return back()->with('success', 'Application submitted successfully.');
    }
}
