<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $student = $user->student;

        $applicationStats = [
            'total_applied' => $student->applications()->count(),
            'pending'       => $student->applications()->where('app_status', 'Pending')->count(),
            'approved'      => $student->applications()->where('app_status', 'Approved')->count(),
        ];

        // Placeholders – you can make them dynamic later
        $reminders = [];
        $recommendedCompanies = [];

        return Inertia::render('Student/Dashboard', [
            'reminders'                => $reminders,
            'recommendedCompanies'     => $recommendedCompanies,
            'applicationStats'         => $applicationStats,
        ]);
    }
}
