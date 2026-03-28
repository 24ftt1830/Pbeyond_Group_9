<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicantController extends Controller
{
    /**
     * Display all applications for the company's quotas
     */
    public function index()
    {
        $company = auth()->user()->company;
        if (!$company) {
            abort(403, 'You are not associated with any company.');
        }

        $applications = Application::with(['student.user', 'quota'])
            ->whereHas('quota', function ($query) use ($company) {
                $query->where('company_id', $company->company_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Company/Applicants', [
            'applications' => $applications,
        ]);
    }

    /**
     * Review an application (approve or reject)
     */
    public function review(Request $request, Application $application)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $company = auth()->user()->company;
        if (!$company || $application->quota->company_id != $company->company_id) {
            abort(403, 'Unauthorized.');
        }

        $newStatus = $request->status === 'approved' ? 'Approved' : 'Rejected';
        $application->app_status = $newStatus;
        $application->save();

        return redirect()->back()->with('success', "Application {$newStatus}.");
    }
}
