<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    public function index()
{
    $applications = auth()->user()->student->applications()
        ->with(['quota.company'])
        ->get()
        ->map(function ($app) {
            $stepMap = [
                'Pending_ILD' => 0,
                'Pending_Company' => 2,
                'Interview_Scheduled' => 3,
                'Approved' => 4,
                'Rejected' => 4,
            ];
            return [
                'id' => $app->application_id,
                'status' => $app->app_status,
                'status_label' => $this->statusLabel($app->app_status),
                'step' => $stepMap[$app->app_status] ?? 0,
                'applied_at' => $app->apply_date,
                'company' => $app->quota->company ? [
                    'id' => $app->quota->company->company_id,
                    'name' => $app->quota->company->company_name,
                ] : null,
            ];
        });

    return Inertia::render('Student/ApplicationTracking', ['applications' => $applications]);
}

    public function accept(Application $application)
    {
        $student = auth()->user()->student;
        if ($application->student_id != $student->student_id) abort(403);
        if ($application->app_status !== 'Approved') {
            return back()->withErrors('You can only accept an approved offer.');
        }
        $application->app_status = 'Accepted'; // optional: add 'Accepted' to ENUM later
        $application->save();
        return back()->with('success', 'Offer accepted successfully.');
    }

   private function statusLabel($status)
{
    return match($status) {
        'Pending_ILD' => 'Under ILD Review',
        'Pending_Company' => 'Under Company Review',
        'Interview_Scheduled' => 'Interview Scheduled',
        'Approved' => 'Approved',
        'Rejected' => 'Rejected',
        default => $status,
    };
}
}
