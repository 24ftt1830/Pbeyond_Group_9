<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicationReviewController extends Controller
{
    public function index()
    {
        $applications = Application::with(['student.user', 'quota.company'])
            ->where('app_status', 'Pending_ILD')
            ->orderBy('apply_date')
            ->get();

        return Inertia::render('Admin/ApplicationReview', [
            'applications' => $applications,
        ]);
    }

    public function approve($id)
{
    $application = Application::findOrFail($id);
    $application->app_status = 'Pending_Company';
    $application->save();

    // Use a redirect that goes back to the review page with a success message
    return redirect()->back()->with('success', 'Application approved.');
}

    public function reject($id)
    {
        $application = Application::findOrFail($id);
        $application->app_status = 'Rejected';
        $application->save();

        return redirect()->route('admin.applications.review')->with('success', 'Application rejected.');
    }
}
