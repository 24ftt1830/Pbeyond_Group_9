<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    public function index()
    {
        // Removed the 'Pending_ILD' filter to allow full read-only access
        $applications = Application::with([
            'student.user', 
            'student.programme', 
            'quota.company'
        ])
        ->orderBy('created_at', 'desc') // show newest application first
        ->get();

        return Inertia::render('Admin/ApplicationList', [
            'applications' => $applications,
        ]);
    }
}