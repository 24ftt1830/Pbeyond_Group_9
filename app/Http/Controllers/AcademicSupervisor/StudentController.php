<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $students = Student::whereHas(
            'academicSupervisorAssignments',
            function ($query) use ($academicSupervisor) {
                $query->where(
                    'academic_supervisor_id',
                    $academicSupervisor->academic_supervisor_id
                );
            }
        )
            ->with('programme')
            ->get();

        return Inertia::render('AcademicSupervisor/Students', [
            'students' => $students,
        ]);
    }

    public function show(Request $request, Student $student)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $isAssigned = $student->academicSupervisorAssignments()
            ->where(
                'academic_supervisor_id',
                $academicSupervisor->academic_supervisor_id
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

        return Inertia::render('AcademicSupervisor/StudentDetails', [
            'student' => $student,
        ]);
    }
}