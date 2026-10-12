<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminRecordChange;
use App\Models\Application;
use App\Models\Company;
use App\Models\PlacementQuota;
use App\Models\Programme;
use App\Services\InternshipWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompanyRecordController extends Controller
{
    public function show(Company $company)
    {
        $company->load([
            'users', 'industrySupervisors.quota', 'industrySupervisors.user',
            'placementQuotas.programmes', 'placementQuotas.applications.student.programme',
            'placementQuotas.applications.student.internship',
        ]);
        return Inertia::render('Admin/CompanyRecord', [
            'company' => $company,
            'programmes' => Programme::orderBy('programme_name')->get(['programme_id', 'programme_name']),
            'today' => now()->toDateString(),
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'office_address' => ['nullable', 'string', 'max:255'],
            'industry_sector' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'additional_information' => ['nullable', 'string'],
            'location_type' => ['nullable', 'in:Local,Overseas'],
        ]);
        DB::transaction(function () use ($company, $data, $request) {
            $before = $company->toArray();
            $company->update($data);
            AdminRecordChange::record($request->user(), $company, 'Updated company profile', $before);
        });
        return back()->with('success', 'Company profile updated.');
    }

    public function storeQuota(Request $request, Company $company)
    {
        return app(\App\Http\Controllers\Company\QuotaController::class)->store($request, $company);
    }

    public function updateQuota(Request $request, PlacementQuota $quota)
    {
        return app(\App\Http\Controllers\Company\QuotaController::class)->update($request, $quota->quota_id);
    }

    public function destroyQuota(PlacementQuota $quota)
    {
        return app(\App\Http\Controllers\Company\QuotaController::class)->destroy($quota->quota_id);
    }

    public function closeQuota(PlacementQuota $quota)
    {
        DB::transaction(function () use ($quota) {
            $before = $quota->toArray();
            $quota->update(['is_released' => false]);
            AdminRecordChange::record(auth()->user(), $quota, 'Closed quota availability', $before);
        });
        return back()->with('success', 'Position hidden from new applications. Existing applicants and interns are retained.');
    }

    public function application(Request $request, Application $application)
    {
        $data = $request->validate([
            'status' => ['required', 'in:Pending,Waitlisted,Recruited,Declined,Interviewing'],
            'interview_date' => ['nullable', 'date'],
        ]);
        app(InternshipWorkflow::class)->application($application, $data, $request->user());
        return back()->with('success', 'Application status updated.');
    }
}
