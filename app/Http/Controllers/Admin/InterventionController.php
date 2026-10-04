<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisorAssignment;
use Inertia\Inertia;

class InterventionController extends Controller
{
    public function index()
    {
        $students = AcademicSupervisorAssignment::query()
            ->whereIn('monitoring_status', [
                'Needs Attention',
                'At Risk',
            ])
            ->with([
                'programme.students',
            ])
            ->get()
            ->flatMap(function ($assignment) {
                return $assignment->programme->students->map(function ($student) use ($assignment) {
                    return [
                        'student_id' => $student->student_id,
                        'student_code' => $student->pb_student_code,
                        'full_name' => $student->full_name,
                        'programme' => $assignment->programme->programme_name,
                        'monitoring_status' => $assignment->monitoring_status,
                    ];
                });
            })->values();

        return Inertia::render('Admin/Interventions', [
            'students' => $students,
        ]);
    }
}
