<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\AcademicSupervisorVisit;
use App\Models\Student;
use Illuminate\Http\Request;

class VisitController extends Controller
{
    public function store(Request $request, Student $student)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $assignment = $student->academicSupervisorAssignments()
            ->where(
                'academic_supervisor_id',
                $academicSupervisor->academic_supervisor_id
            )
            ->firstOrFail();

        $validated = $request->validate([
            'visit_date' => ['required', 'date'],
            'notes' => ['required', 'string'],
        ]);

        AcademicSupervisorVisit::create([
            'assignment_id' => $assignment->assignment_id,
            'visit_date' => $validated['visit_date'],
            'notes' => $validated['notes'],
        ]);

        return redirect()
            ->route('academic-supervisor.student.show', $student->student_id)
            ->with('success', 'Internship visit recorded successfully.');
    }
}