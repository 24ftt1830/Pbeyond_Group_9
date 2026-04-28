<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\PlacementQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    /**
     * Display all applications for the company's quotas
     */
    public function index()
    {
        // List all approved quotas for the company
        $company = Auth::user()->company;

        $quotas = $company->placementQuotas()
            ->with(['programme'])
            ->withCount('applications')
            ->where('quota_status', 'Approved')
            ->latest()
            ->get();

        return Inertia::render('Company/Applications/Index', [
            'quotas' => $quotas,
        ]);
    }

    public function show(PlacementQuota $quota)
    {
        $company = Auth::user()->company;

        // ensure the company owns this quota
        if ($quota->company_id !== $company->company_id) {
            abort(403, 'You do not have permission to view this quota.');
        }

        // ensure quota is Approved
        if ($quota->quota_status !== 'Approved') {
            abort(404, 'Quota not found or not yet approved.');
        }

        $quota->load('applications.student.programme');

        return Inertia::render('Company/Applications/Show', [
            'quota' => $quota,
            'applications' => $quota->applications,
        ]);
    }

    public function updateStatus(Request $request, PlacementQuota $quota, Application $application)
    {
        $company = Auth::user()->company;

        if ((int) $quota->company_id !== (int) $company->company_id) {
            abort(403, 'Unauthorized action.');
        }

        if ((int) $application->quota_id !== (int) $quota->quota_id) {
            abort(403, 'This application does not belong to the selected quota.');
        }

        $request->validate([
            'status' => 'required|in:Waitlisted,Recruited,Declined',
        ]);

        $application->update([
            'app_status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Status updated successfully.');
    }
}
