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
     * Display all applications for the company's approved quotas.
     */
    public function index()
    {
        $company = Auth::user()->company;

        if (!$company) {
            abort(403, 'Your account is not linked to a company.');
        }

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

    /**
     * Display applications belonging to a specific quota.
     */
    public function show(PlacementQuota $quota)
    {
        $company = Auth::user()->company;

        if (!$company) {
            abort(403, 'Your account is not linked to a company.');
        }

        // Make sure this quota belongs to the logged-in company.
        if ((int) $quota->company_id !== (int) $company->company_id) {
            abort(403, 'You do not have permission to view this quota.');
        }

        // Only approved quotas can be viewed.
        if ($quota->quota_status !== 'Approved') {
            abort(404, 'Quota not found or not yet approved.');
        }

        $quota->load([
            'programme',
            'applications.student.programme',
            'applications.student.user',
        ]);

        // Safely check all possible database field names for interview status
        $requiresInterview = (bool) (
            $quota->has_interview ??
            $quota->requires_interview ??
            $quota->interview_required ??
            $quota->is_interview_required ??
            false
        );

        return Inertia::render('Company/Applications/Show', [
            'quota' => $quota,
            'applications' => $quota->applications,
            'requiresInterview' => $requiresInterview,
        ]);
    }

    /**
     * Display one individual student application.
     */
    public function viewSingle(Application $application)
    {
        $company = Auth::user()->company;

        if (!$company) {
            abort(403, 'Your account is not linked to a company.');
        }

        // Load the quota first so we can verify ownership.
        $application->load([
            'quota',
            'student.programme',
            'student.user',
        ]);

        // Make sure the application belongs to one of this company's quotas.
        if (
            !$application->quota ||
            (int) $application->quota->company_id !== (int) $company->company_id
        ) {
            abort(403, 'You do not have permission to view this application.');
        }

        $requiresInterview = (bool) (
            $application->quota->has_interview ??
            $application->quota->requires_interview ??
            $application->quota->interview_required ??
            $application->quota->is_interview_required ??
            false
        );

        return Inertia::render('Company/Applications/ViewSingle', [
            'application' => $application,
            'student' => $application->student,
            'quota' => $application->quota,
            'requiresInterview' => $requiresInterview,
        ]);
    }

    /**
     * Update the application status.
     */
    public function updateStatus(
        Request $request,
        PlacementQuota $quota,
        Application $application
    ) {
        $company = Auth::user()->company;

        if (!$company) {
            abort(403, 'Your account is not linked to a company.');
        }

        // Make sure the quota belongs to this company.
        if ((int) $quota->company_id !== (int) $company->company_id) {
            abort(403, 'Unauthorized action.');
        }

        // Make sure the application belongs to this quota.
        if ((int) $application->quota_id !== (int) $quota->quota_id) {
            abort(403, 'This application does not belong to the selected quota.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Waitlisted,Recruited,Declined,Interviewing',
            'interview_date' => 'nullable|date',
        ]);

        $updateData = [
            'app_status' => $validated['status'],
        ];

        // Explicitly handle clearing vs setting interview_date
        if ($validated['status'] === 'Interviewing') {
            if ($request->filled('interview_date')) {
                $updateData['interview_date'] = $validated['interview_date'];
            }
        } else {
            $updateData['interview_date'] = null;
        }

        $application->update($updateData);

        return redirect()->back()->with(
            'success',
            'Status updated successfully.'
        );
    }
}