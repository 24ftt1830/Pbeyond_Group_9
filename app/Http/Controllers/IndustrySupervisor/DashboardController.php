<?php

namespace App\Http\Controllers\IndustrySupervisor;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\IndustrySupervisor;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $supervisor = IndustrySupervisor::where('user_id', Auth::id())
            ->with('quota')
            ->firstOrFail();

        $applications = $supervisor->applications()
            ->where('app_status', 'Recruited')
            ->with('student.programme')
            ->orderByDesc('updated_at')
            ->get();

        $applicantIds = $applications->pluck('student_id')->unique();
        $evaluations = Evaluation::where('industry_supervisor_id', $supervisor->supervisor_id)
            ->whereIn('student_id', $applicantIds)
            ->count();

        return Inertia::render('IndustrySupervisor/Dashboard', [
            'quota' => $supervisor->quota?->only(['quota_id', 'job_title', 'total_slots']),
            'stats' => [
                'students_assigned' => $applications->unique('student_id')->count(),
                'position_slots' => $supervisor->quota?->total_slots ?? 0,
                'evaluations' => $evaluations,
                'evaluations_due' => max(0, $applications->unique('student_id')->count() - $evaluations),
            ],
            'recentRecruits' => $applications->take(6)->values(),
        ]);
    }
}
