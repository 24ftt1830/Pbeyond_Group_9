<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\Evaluation;
use App\Models\Student;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function complete(Request $request, Student $student)
    {
        $academicSupervisor = AcademicSupervisor::where(
            'user_id',
            auth()->user()->user_id
        )->firstOrFail();

        $student->academicSupervisorAssignments()
            ->where(
                'academic_supervisor_id',
                $academicSupervisor->academic_supervisor_id
            )
            ->firstOrFail();

        $evaluation = Evaluation::where('student_id', $student->student_id)
            ->firstOrFail();

        $evaluation->update([
            'academic_review_status' => 'Completed',
            'academic_reviewed_at' => now(),
        ]);

        return redirect()
            ->route('academic-supervisor.student.show', $student->student_id)
            ->with('success', 'Evaluation marked as completed.');
    }
}
