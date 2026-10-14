<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\AcademicSemester;
use App\Models\Application;
use App\Services\InternshipWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InternController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;

        if (!$company) {
            abort(403, 'Your account is not linked to a company.');
        }

        $today = now()->startOfDay();

        $applications = Application::query()
            ->where('app_status', 'Recruited')
            ->whereHas('quota', function ($query) use ($company) {
                $query->where('company_id', $company->company_id);
            })
            ->with([
                'quota',
                'student.programme',
                'student.internship',
            ])
            ->orderByDesc('updated_at')
            ->get();

        $semestersByIntake = $applications->pluck('student.intake_semester_id')
            ->filter()
            ->unique()
            ->mapWithKeys(fn ($intakeId) => [
                $intakeId => AcademicSemester::internshipTermForIntake((int) $intakeId),
            ]);

        $interns = $applications->groupBy('student_id')
            ->map(function ($applications) use ($today, $semestersByIntake) {
                $application = $applications->first();
                $student = $application->student;
                $internship = $student?->internship;
                $semester = $semestersByIntake->get($student?->intake_semester_id);

                $internshipStatus = 'Dates not set';

                if ($internship) {
                    if ($internship->start_date->gt($today)) {
                        $internshipStatus = 'Upcoming';
                    } elseif ($internship->end_date->lt($today)) {
                        $internshipStatus = 'Ended';
                    } else {
                        $internshipStatus = 'In Progress';
                    }
                }

                return [
                    'application_id' => $application->getKey(),
                    'student_id' => $student?->student_id,
                    'student_code' => $student?->pb_student_code,
                    'full_name' => $student?->full_name ?? 'Unknown Student',
                    'programme_name' => $student?->programme?->programme_name,
                    'positions' => $applications
                        ->map(fn ($item) => $item->quota?->job_title)
                        ->filter()
                        ->unique()
                        ->values(),
                    'start_date' => $internship?->start_date?->toDateString(),
                    'end_date' => $internship?->end_date?->toDateString(),
                    'internship_semester' => $semester ? [
                        'name' => $semester->name,
                        'starts_on' => $semester->starts_on->toDateString(),
                        'ends_on' => $semester->ends_on->toDateString(),
                    ] : null,
                    'internship_status' => $internshipStatus,
                ];
            })
            ->values();

        return Inertia::render('Company/Interns', [
            'interns' => $interns,
            'companyName' => $company->company_name,
        ]);
    }

    public function updateDates(Request $request, Application $application)
    {
        $company = Auth::user()->company;

        if (!$company) {
            abort(403, 'Your account is not linked to a company.');
        }

        $application->load(['quota', 'student']);

        if (
            !$application->quota
            || (int) $application->quota->company_id !== (int) $company->company_id
        ) {
            abort(403, 'You do not have permission to update this internship.');
        }

        abort_unless($application->app_status === 'Recruited', 404);

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ], [
            'end_date.after_or_equal' => 'The internship end date must be on or after its start date.',
        ]);

        app(InternshipWorkflow::class)->dates($application->student, $validated, $request->user());

        return back()->with('success', 'Internship dates saved successfully.');
    }
}
