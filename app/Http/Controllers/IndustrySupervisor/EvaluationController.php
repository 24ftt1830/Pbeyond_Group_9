<?php

namespace App\Http\Controllers\IndustrySupervisor;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\IndustrySupervisor;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationController extends Controller
{
    /**
     * Show the evaluation form for a single assigned student.
     */
    public function create(Student $student): Response
    {
        $supervisor = $this->currentSupervisor();

        $this->authorizeStudent($supervisor, $student);

        $evaluation = Evaluation::where('student_id', $student->student_id)
            ->where('industry_supervisor_id', $supervisor->supervisor_id)
            ->first();

        return Inertia::render('IndustrySupervisor/Evaluation', [
            'student' => $student->only([
                'student_id',
                'pb_student_code',
                'full_name',
            ]),
            'evaluation' => $evaluation,
        ]);
    }

    /**
     * Store (or update) the evaluation for a student.
     */
    public function store(Request $request, Student $student): RedirectResponse
    {
        $supervisor = $this->currentSupervisor();

        $this->authorizeStudent($supervisor, $student);

        $validated = $request->validate([
            'attendance_punctuality' => ['required', 'integer', 'between:1,5'],
            'work_quality' => ['required', 'integer', 'between:1,5'],
            'technical_skills' => ['required', 'integer', 'between:1,5'],
            'communication_skills' => ['required', 'integer', 'between:1,5'],
            'teamwork' => ['required', 'integer', 'between:1,5'],
            'initiative' => ['required', 'integer', 'between:1,5'],
            'professionalism' => ['required', 'integer', 'between:1,5'],
            'strengths' => ['nullable', 'string', 'max:2000'],
            'areas_for_improvement' => ['nullable', 'string', 'max:2000'],
            'comments' => ['nullable', 'string', 'max:2000'],
            'recommendation' => ['required', 'in:Highly Recommended,Recommended,Recommended with Reservations,Not Recommended'],
        ]);

        Evaluation::updateOrCreate(
            [
                'student_id' => $student->student_id,
                'industry_supervisor_id' => $supervisor->supervisor_id,
            ],
            $validated + ['evaluated_at' => now()]
        );

        return redirect()
            ->route('industry-supervisor.student.show', $student->student_id)
            ->with('success', 'Evaluation submitted successfully.');
    }

    private function currentSupervisor(): IndustrySupervisor
    {
        return IndustrySupervisor::where('user_id', Auth::id())->firstOrFail();
    }

    private function authorizeStudent(IndustrySupervisor $supervisor, Student $student): void
    {
        $isAssigned = $supervisor->applications()
            ->where('student_id', $student->student_id)
            ->where('app_status', 'Recruited')
            ->exists();

        abort_unless($isAssigned, 403, 'This student is not assigned to you.');
    }
}
