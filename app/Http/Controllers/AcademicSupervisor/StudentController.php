<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\Evaluation;
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

        $assignedClass = $academicSupervisor->assignments()
            ->with('programme')
            ->first()
            ?->programme;

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
            'assignedClass' => $assignedClass
                ? $assignedClass->only(['class_id', 'programme_name'])
                : null,
        ]);
    }

    public function show(Request $request, Student $student)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignment = $student->programme->academicSupervisorAssignments()
            ->where(
                'academic_supervisor_id',
                $academicSupervisor->academic_supervisor_id
            )
            ->firstOrFail();

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

        $visits = $assignment->visits()
            ->orderByDesc('visit_date')
            ->get();

        $evaluation = Evaluation::where('student_id', $student->student_id)
            ->first();

        return Inertia::render('AcademicSupervisor/StudentDetails', [
            'student' => $student,
            'visits' => $visits,
            'evaluation' => $evaluation,
            'monitoringStatus' => $assignment->monitoring_status,
        ]);
    }

    public function updateMonitoringStatus(
        Request $request,
        Student $student
    ) {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignment = $student->programme->academicSupervisorAssignments()
            ->where(
                'academic_supervisor_id',
                $academicSupervisor->academic_supervisor_id
            )
            ->firstOrFail();

        $validated = $request->validate([
            'monitoring_status' => [
                'required',
                'in:On Track,Needs Attention,At Risk',
            ],
        ]);

        $assignment->update([
            'monitoring_status' => $validated['monitoring_status'],
        ]);

        return redirect()
            ->route(
                'academic-supervisor.student.show',
                $student->student_id
            )
            ->with('success', 'Monitoring status updated successfully.');
    }
}
