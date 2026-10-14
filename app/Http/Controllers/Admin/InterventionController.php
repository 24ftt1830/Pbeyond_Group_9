<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSemester;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InterventionController extends Controller
{
    public function index(Request $request)
    {
        $selectedSemester = $request->integer('semester');
        $term = AcademicSemester::find($selectedSemester) ?? AcademicSemester::query()
            ->whereDate('starts_on', '<=', now()->toDateString())
            ->whereDate('ends_on', '>=', now()->toDateString())
            ->first()
            ?? AcademicSemester::query()->whereDate('starts_on', '<=', now()->toDateString())->orderByDesc('starts_on')->first();
        $selectedSemester = $term?->id;
        $intakeSemesterId = AcademicSemester::intakeTermIdForInternship($selectedSemester ? (int) $selectedSemester : null);

        $students = Student::query()
            ->whereHas('internship', function ($query) {
                $query->whereNotNull('start_date')->whereNotNull('end_date');
            })
            ->whereHas('programme.academicSupervisorAssignments', function ($query) {
                $query->whereIn('monitoring_status', ['Needs Attention', 'At Risk']);
            })
            ->when($intakeSemesterId, fn ($query) => $query->where('intake_semester_id', $intakeSemesterId), fn ($query) => $query->whereRaw('1 = 0'))
            ->when($term, fn ($query) => $query->whereHas('internship', fn ($internship) => $internship
                ->whereDate('start_date', '<=', $term->ends_on->toDateString())
                ->whereDate('end_date', '>=', $term->starts_on->toDateString())))
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
            'selectedSemester' => $selectedSemester ? (int) $selectedSemester : null,
            'selectedSemesterName' => $term?->name,
        ]);
    }
}
