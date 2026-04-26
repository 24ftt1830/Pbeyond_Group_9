<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApplicationTrackingController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;

        if (!$student) {
            return back()->withErrors(['message' => 'Student profile not found.']);
        }

        $applications = Application::with('quota.company')
            ->where('student_id', $student->student_id)
            ->latest()
            ->get();

        $formattedApplications = $applications->map(function ($app) {
            return [
                'id' => $app->id,
                'status_label' => $app->app_status, 
                'applied_at' => $app->apply_date,
                'step' => $this->calculateStep($app->app_status), 
                'company' => [
                    'name' => $app->quota->company->company_name ?? 'Unknown Company',
                ],
            ];
        });

        return Inertia::render('Student/ApplicationTracking', [
            'applications' => $formattedApplications,
        ]);
    }

    private function calculateStep($status)
{
    return match ($status) {
        'Pending' => 0,
        'Waitlisted', 'Interview' => 1, 
        'Recruited', 'Declined' => 2,
        default => 0,
    };
}
}