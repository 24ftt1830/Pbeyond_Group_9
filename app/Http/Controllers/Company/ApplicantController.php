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
   // app/Http/Controllers/Company/ApplicantController.php
public function index()
{
    $company = auth()->user()->company;
    $applications = Application::with(['student.user', 'quota'])
        ->whereHas('quota', fn($q) => $q->where('company_id', $company->company_id))
        ->where('app_status', 'Pending_Company')
        ->orderBy('created_at', 'desc')
        ->get();
    return Inertia::render('Company/Applicants', ['applications' => $applications]);
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
