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
        )->firstOrFail();

        $students = $industrySupervisor->students()
            ->with('programme')
            ->get();

        return Inertia::render('IndustrySupervisor/Students', [
            'students' => $students,
        ]);
    }

    public function show(Request $request, Student $student)
    {
        $industrySupervisor = IndustrySupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = $industrySupervisor->students()
            ->where(
                'students.student_id',
                $student->student_id
            )
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
        ]);
    }
}