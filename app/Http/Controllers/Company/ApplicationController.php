<?php

namespace App\Http\Controllers\Company;

use App\Services\InternshipWorkflow;

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

        // Only approved quotas can be viewed (case-insensitive check).
        if (strtolower($quota->quota_status) !== 'approved') {
            abort(404, 'Quota not found or not yet approved.');
        }

        $quota->load([
            'applications.branch',
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

    /** Display a candidate's application details for their own company only. */
    public function details(Application $application)
    {
        $company = Auth::user()->company;
        abort_unless($company, 403, 'Your account is not linked to a company.');

        $application->load('quota');
        abort_unless($application->quota
            && (int) $application->quota->company_id === (int) $company->company_id,
            403, 'You do not have permission to view this application.');
        abort_unless(strtolower($application->quota->quota_status) === 'approved', 404);

        $application->load(['student.user', 'student.programme', 'branch', 'statusHistories']);
        $candidateIds = $application->quota->applications()->orderBy('id')->pluck('id');
        $index = $candidateIds->search(fn ($id) => (int) $id === (int) $application->id);

        return Inertia::render('Company/Applications/Details', [
            'application' => array_merge(
                $application->only(['id', 'quota_id', 'app_status', 'interview_date', 'created_at']),
                [
                    'student' => array_merge(
                        $application->student->only(['full_name', 'pb_student_code', 'mobile_phone', 'cgpa']),
                        [
                            'email' => $application->student->user?->email,
                            'programme_name' => $application->student->programme?->programme_name,
                        ]
                    ),
                    'branch' => $application->branch?->only(['name', 'address', 'district']),
                    'history' => $application->statusHistories->map(fn ($history) =>
                        $history->only(['id', 'from_status', 'to_status', 'created_at']))->values(),
                    'has_cv' => !empty($application->cv_snapshot) || !empty($application->student->cv_snapshot),
                ]
            ),
            'quota' => $application->quota->only(['quota_id', 'slug', 'job_title', 'interview_required']),
            'candidates' => [
                'position' => $index === false ? 0 : $index + 1,
                'total' => $candidateIds->count(),
                'previous_id' => $index !== false && $index > 0 ? $candidateIds[$index - 1] : null,
                'next_id' => $index !== false ? $candidateIds->get($index + 1) : null,
            ],
        ]);
    }

    /** Display the generated CV attached to an individual application. */
    public function viewSingle(Application $application)
    {
        $company = Auth::user()->company;

        if (!$company) {
            abort(403, 'Your account is not linked to a company.');
        }

        $application->load([
            'quota',
            'student',
        ]);

        // Make sure this application belongs to this company.
        if (
            !$application->quota ||
            (int) $application->quota->company_id !== (int) $company->company_id
        ) {
            abort(403, 'You do not have permission to view this application.');
        }

        $cvSnapshot = $application->cv_snapshot ?: $application->student?->cv_snapshot;
        abort_unless($cvSnapshot, 404, 'No generated CV is available for this application.');

        return Inertia::render('Student/generator_cv', [
            'student' => $cvSnapshot,
            'isCompanyView' => true,
            'quotaId' => $application->quota_id,
            'cvRevision' => (int) ($application->cv_revision ?? 1),
            'cvSnapshotUpdatedAt' => $application->cv_snapshot_updated_at?->toIso8601String(),
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
            'status' => 'required|in:Recruited,Declined,Interviewing',
            'interview_date' => 'nullable|date',
        ]);

        app(InternshipWorkflow::class)->application($application, $validated, $request->user());

        return redirect()->back()->with(
            'success',
            'Status updated successfully.'
        );
    }
}
