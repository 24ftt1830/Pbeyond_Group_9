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
            $quota = $app->quota;

            // Check database field names for interview requirement
            $requiresInterview = (bool) (
                $quota->has_interview ??
                $quota->requires_interview ??
                $quota->interview_required ??
                $quota->is_interview_required ??
                false
            );

            return [
                'id' => $app->application_id ?? $app->id,
                'status_label' => $app->app_status ?? 'Pending', 
                'applied_at' => $app->created_at,
                'interview_date' => $app->interview_date,
                'requires_interview' => $requiresInterview,
                'reviewed_at' => in_array($app->app_status, ['Recruited', 'Declined']) ? $app->updated_at : null,
                'step' => $this->calculateStep($app->app_status, $requiresInterview), 
                'company' => [
                    'id' => $quota->company->company_id ?? $quota->company->id ?? 0,
                    'name' => $quota->company->company_name ?? 'Unknown Company',
                ],
                'quota' => [
                    'job_title' => $quota->job_title ?? 'N/A',
                ]
            ];
        });

        return Inertia::render('Student/ApplicationTracking', [
            'applications' => $formattedApplications,
        ]);
    }

    private function calculateStep($status, $requiresInterview)
    {
        if ($requiresInterview) {
            return match ($status) {
                'Pending' => 0,
                'Interviewing' => 1,
                'Waitlisted' => 1,
                'Recruited', 'Declined' => 2,
                default => 0,
            };
        }

        return match ($status) {
            'Pending' => 0,
            'Waitlisted' => 1,
            'Recruited', 'Declined' => 2,
            default => 0,
        };
    }
}