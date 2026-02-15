<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Pass specific data props based on the user's role
        return Inertia::render('Dashboard', [
            'roleData' => match ($user->role) {
                'admin'   => ['totalUsers' => 1250, 'revenue' => 45000],
                'company' => ['employees' => 24, 'activeJobs' => 5],
                'user'    => ['tasks' => 12, 'completed' => 8],
                default   => [],
            }
        ]);
    }
}