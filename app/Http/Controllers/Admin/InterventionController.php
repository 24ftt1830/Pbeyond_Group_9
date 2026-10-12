<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InterventionController extends Controller
{
    public function index(Request $request)
    {
        $selectedSemester = $request->integer('semester');

        $students = Student::query()
            ->whereHas('internship', function ($query) {
                $query
                    ->whereDate('start_date', '<=', now())
                    ->whereDate('end_date', '>=', now());
            })
            ->whereHas('programme.academicSupervisorAssignments', function ($query) {
                $query->whereIn('monitoring_status', ['Needs Attention', 'At Risk']);
            })
            ->when($selectedSemester, function ($query) use ($selectedSemester) {
                $query->where('current_semester', $selectedSemester);
            })
            ->with([
                'internship',
                'programme.academicSupervisorAssignments' => function ($query) {
                    $query->whereIn('monitoring_status', ['Needs Attention', 'At Risk']);
                },
                'applications' => function ($query) {
                    $query->where('app_status', 'Recruited')
                        ->orderByDesc('updated_at')
                        ->with('quota.company');
                },
            ])
            ->orderBy('full_name')
            ->get()
            ->map(function ($student) {
                $statuses = $student->programme?->academicSupervisorAssignments
                    ->pluck('monitoring_status') ?? collect();
                $application = $student->applications->first();

                return [
                    'student_id' => $student->student_id,
                    'student_code' => $student->pb_student_code,
                    'full_name' => $student->full_name,
                    'programme' => $student->programme?->programme_name,
                    'company_name' => $application?->quota?->company?->company_name,
                    'start_date' => $student->internship?->start_date?->toDateString(),
                    'end_date' => $student->internship?->end_date?->toDateString(),
                    'monitoring_status' => $statuses->contains('At Risk') ? 'At Risk' : 'Needs Attention',
                ];
            });

        return Inertia::render('Admin/Interventions', [
            'students' => $students,
            'selectedSemester' => $selectedSemester ?: null,
        ]);
    }
}
