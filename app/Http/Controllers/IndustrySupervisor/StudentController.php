<?php

namespace App\Http\Controllers\IndustrySupervisor;

use App\Http\Controllers\Controller;
use App\Models\IndustrySupervisor;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $industrySupervisor = IndustrySupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->with('quota')->firstOrFail();

        $students = $industrySupervisor->quota_id
            ? Student::whereHas('applications', function ($query) use ($industrySupervisor) {
                $query->where('quota_id', $industrySupervisor->quota_id)
                    ->where('app_status', 'Recruited');
            })
                ->with('programme')
                ->orderBy('full_name')
                ->get()
            : collect();

        return Inertia::render('IndustrySupervisor/Students', [
            'students' => $students,
            'quota' => $industrySupervisor->quota,
        ]);
    }

    public function show(Request $request, Student $student)
    {
        $industrySupervisor = IndustrySupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = $industrySupervisor->applications()
            ->where('student_id', $student->student_id)
            ->where('app_status', 'Recruited')
            ->exists();

        abort_unless($isAssigned, 403);

        $student->load([
            'programme',
            'skills',
            'languages',
            'education',
            'professionalProfile',
            'projects',
            'activities',
            'achievements',
            'referees',
            'softSkills',
            'workExperiences',
        ]);

        return Inertia::render('IndustrySupervisor/StudentDetails', [
            'student' => $student,
            'quota' => $industrySupervisor->quota()->first(),
        ]);
    }
}
