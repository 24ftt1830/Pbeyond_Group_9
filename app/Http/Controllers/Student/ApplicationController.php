<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    public function index()
    {
        $applications = auth()->user()->student->applications()
            ->with(['quota.company'])
            ->get()
            ->map(fn($app) => [
                'id'         => $app->application_id,
                'status'     => $app->app_status,
                'applied_at' => $app->apply_date,
                'company'    => $app->quota->company ? [
                    'id'   => $app->quota->company->company_id,
                    'name' => $app->quota->company->company_name,
                ] : null,
            ]);

        return Inertia::render('Student/ApplicationTracking', [
            'applications' => $applications,
        ]);
    }



}
