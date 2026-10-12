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
    /** Display companies with approved, released quotas available to all students. */
    public function index()
    {
        $companies = Company::whereHas(
            'placementQuotas',
            fn ($query) => $query->available()
        )
        ->with([
            'placementQuotas' => fn ($query) => $query->available(),
        ])
        ->get();

        $companiesData = $companies->map(function ($company) {
            $available = $company->placementQuotas
                ->sum(fn ($q) => $q->remaining_slots);

            return [
                'company_id'      => $company->company_id,
                'company_name'    => $company->company_name,
                'available'       => (int) $available,
                'industry_sector' => $company->industry_sector ?? 'General',
                'office_address'  => $company->office_address ?? 'Brunei Muara',
            ];
        });

        return Inertia::render('Student/Companies', [
            'companies' => $companiesData,
        ]);
    }

    /** Display all approved, released positions for a company. */
    public function show($id)
    {
        $student = Auth::user()->student;
        $company = Company::findOrFail($id);

        $quotas = PlacementQuota::available()
            ->where('company_id', $id)
            ->with('programmes')
            ->get();

        // Query primary key 'id' and 'quota_id' explicitly
        $applications = $student->applications()
            ->get(['id', 'quota_id'])
            ->map(fn ($app) => [
                'application_id' => (int) $app->id,
                'quota_id'       => (int) $app->quota_id,
            ]);

        return Inertia::render('Student/ViewCompany', [
            'company'      => $company,
            'quotas'       => $quotas,
            'applications' => $applications,
        ]);
    }

    /**
     * Handle application submission for a quota position.
     */
    public function apply(Request $request, $companyId)
    {
        $student = Auth::user()->student;

        if (!$student || !$student->isProfileComplete()) {
            return back()->withErrors([
                'message' => 'Complete and save all required profile information before applying for a position.',
            ]);
        }

        if (empty($student->cv_generated_at) || empty($student->cv_snapshot)) {
            return back()->withErrors([
                'message' => 'Generate your CV from your profile before applying for a position.',
            ]);
        }

        $request->validate([
            'quota_id' => [
                'required',
                'exists:placement_quotas,quota_id',
            ],
        ]);

        if ($student->applications()->count() >= 3) {
            return back()->withErrors([
                'message' => 'You have reached the maximum limit of 3 application choices.',
            ]);
        }

        $quota = PlacementQuota::available()
            ->where('quota_id', $request->quota_id)
            ->where('company_id', $companyId)
            ->first();

        if (!$quota) {
            return back()->withErrors([
                'message' => 'This position is no longer available.',
            ]);
        }

        if (
            $student->applications()
                ->where('quota_id', $quota->quota_id)
                ->exists()
        ) {
            return back()->withErrors([
                'message' => 'You have already applied for this position.',
            ]);
        }

        if ($quota->remaining_slots <= 0) {
            return back()->withErrors([
                'message' => 'This quota is already full.',
            ]);
        }

        Application::create([
            'student_id' => $student->student_id,
            'quota_id'   => $quota->quota_id,
            'app_status' => 'Pending',
        ]);

        return back()->with(
            'success',
            'Application submitted!'
        );
    }

    /**
     * Cancel/delete a pending application submitted by the student.
     */
    public function cancel($application)
    {
        $student = Auth::user()->student;

        $applicationId = $application instanceof Application ? $application->id : $application;

        $appRecord = $student->applications()
            ->where('id', $applicationId)
            ->first();

        if (!$appRecord) {
            return back()->withErrors([
                'message' => 'Application not found or unauthorized action.',
            ]);
        }

        if ($appRecord->app_status !== 'Pending') {
            return back()->withErrors([
                'message' => 'You can only cancel applications that are pending review.',
            ]);
        }

        $appRecord->delete();

        return back()->with(
            'success',
            'Application cancelled successfully!'
        );
    }
}
