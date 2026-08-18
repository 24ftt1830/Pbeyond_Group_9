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
     * Display companies with quotas available
     * for the student's exact programme.
     */
    public function index()
    {
        $student = Auth::user()->student;

        $programmeId = $student->programme_id;

        $companies = Company::whereHas(
            'placementQuotas',
            function ($query) use ($programmeId) {
                $query->available()
                    ->whereHas('programmes', function ($programmeQuery) use ($programmeId) {
                        $programmeQuery->where(
                            'programmes.programme_id',
                            $programmeId
                        );
                    });
            }
        )
        ->with([
            'placementQuotas' => function ($query) use ($programmeId) {
                $query->available()
                    ->whereHas('programmes', function ($programmeQuery) use ($programmeId) {
                        $programmeQuery->where(
                            'programmes.programme_id',
                            $programmeId
                        );
                    })
                    ->with('programmes');
            }
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
            'companies'        => $companiesData,
            'studentProgramme' => $student->programme->programme_name,
        ]);
    }

    /**
     * Display a specific company and positions
     * available for the student's exact programme.
     */
    public function show($id)
    {
        $student = Auth::user()->student;

        $programmeId = $student->programme_id;

        $company = Company::findOrFail($id);

        $quotas = PlacementQuota::available()
            ->where('company_id', $id)
            ->whereHas('programmes', function ($query) use ($programmeId) {
                $query->where(
                    'programmes.programme_id',
                    $programmeId
                );
            })
            ->with('programmes')
            ->get();

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

        $programmeId = $student->programme_id;

        $request->validate([
            'quota_id' => [
                'required',
                'exists:placement_quotas,quota_id',
            ],
        ]);

        /**
         * Enforce the maximum of 3 application choices
         * across all companies and quotas.
         */
        if ($student->applications()->count() >= 3) {
            return back()->withErrors([
                'message' => 'You have reached the maximum limit of 3 application choices.',
            ]);
        }

        /**
         * Find the quota only if:
         *
         * 1. It is available/released.
         * 2. It belongs to the selected company.
         * 3. The student's exact programme is one of
         *    the programmes selected by the company.
         */
        $quota = PlacementQuota::available()
            ->where('quota_id', $request->quota_id)
            ->where('company_id', $companyId)
            ->whereHas('programmes', function ($query) use ($programmeId) {
                $query->where(
                    'programmes.programme_id',
                    $programmeId
                );
            })
            ->first();

        if (!$quota) {
            return back()->withErrors([
                'message' => 'This position is not available for your programme.',
            ]);
        }

        /**
         * Prevent duplicate application.
         */
        if (
            $student->applications()
                ->where('quota_id', $quota->quota_id)
                ->exists()
        ) {
            return back()->withErrors([
                'message' => 'You have already applied for this position.',
            ]);
        }

        /**
         * Check whether the quota still has available slots.
         */
        if ($quota->remaining_slots <= 0) {
            return back()->withErrors([
                'message' => 'This quota is already full.',
            ]);
        }

        /**
         * CGPA is intentionally NOT checked.
         *
         * Eligibility is based on the student's
         * programme selection only.
         */
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
}