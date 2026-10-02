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
                'student' => function ($query) {
                    $query->with('programme');
                },
            ])
            ->get()
            ->map(function ($assignment) {
                return [
                    'student_id' => $assignment->student->student_id,
                    'student_code' => $assignment->student->pb_student_code,
                    'full_name' => $assignment->student->full_name,
                    'programme' => $assignment->student->programme?->programme_name,
                    'monitoring_status' => $assignment->monitoring_status,
                ];
            });

        return Inertia::render('Admin/Interventions', [
            'students' => $students,
        ]);
    }
}