<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSemester;
use App\Models\Application;
use App\Models\Company;
use App\Models\LogbookWeeklySubmission;
use App\Models\PlacementQuota;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->startOfDay();
        $semesters = AcademicSemester::query()->orderBy('starts_on')->orderBy('id')->get();
        $activeSemester = $semesters->first(fn ($semester) =>
            $semester->starts_on->lte($today) && $semester->ends_on->gte($today)
        );
        $mostRecentSemester = $semesters->filter(fn ($semester) => $semester->starts_on->lte($today))->last();
        $requestedSemesterId = $request->integer('semester');
        $selectedTerm = $semesters->first(fn ($semester) => (int) $semester->id === $requestedSemesterId)
            ?? $activeSemester
            ?? $mostRecentSemester
            ?? $semesters->first();

        $selectedSemester = $selectedTerm ? (int) $selectedTerm->id : null;
        $intakeSemesterId = AcademicSemester::intakeTermIdForInternship($selectedSemester);
        $termStart = $selectedTerm?->starts_on->copy()->startOfDay();
        $termEnd = $selectedTerm?->ends_on->copy()->endOfDay();

        $cohort = Student::query()
            ->when($intakeSemesterId, fn ($query) => $query->where('intake_semester_id', $intakeSemesterId), fn ($query) => $query->whereRaw('1 = 0'))
            ->with([
                'internship',
                'programme.academicSupervisorAssignments',
                'applications' => fn ($query) => $query
                    ->where('app_status', 'Recruited')
                    ->whereHas('quota', fn ($quota) => $quota->where('academic_semester_id', $selectedSemester ?? 0))
                    ->orderByDesc('updated_at')
                    ->with('quota.company'),
            ])
            ->orderBy('full_name')
            ->get();

        $formatProgressStudent = function ($student) {
            $internship = $student->internship;
            $application = $student->applications->first();

            return [
                'student_id' => $student->student_id,
                'student_code' => $student->pb_student_code,
                'full_name' => $student->full_name,
                'programme_name' => $student->programme?->programme_name,
                'company_name' => $application?->quota?->company?->company_name,
                'start_date' => $internship?->start_date?->toDateString(),
                'end_date' => $internship?->end_date?->toDateString(),
            ];
        };

        $internshipStudents = $cohort->filter(function ($student) use ($termStart, $termEnd) {
            $internship = $student->internship;
            return $termStart && $termEnd && $internship
                && $internship->start_date?->lte($termEnd)
                && $internship->end_date?->gte($termStart);
        })->values();

        $pendingCompanies = Company::where('is_approved', false)->count();
        $pendingQuotas = PlacementQuota::where('quota_status', 'Pending')
            ->where('academic_semester_id', $selectedSemester ?? 0)
            ->count();

        $totalStudents = $cohort->count();
        $placedStudents = $cohort->filter(fn ($student) => $student->applications->isNotEmpty())->count();
        $unplacedStudents = max($totalStudents - $placedStudents, 0);

        $submittedWeekKeys = collect();
        if ($termStart && $termEnd && $internshipStudents->isNotEmpty()) {
            $submittedWeekKeys = LogbookWeeklySubmission::query()
                ->whereIn('student_id', $internshipStudents->pluck('student_id'))
                ->whereDate('week_start', '<=', $termEnd->toDateString())
                ->whereDate('week_start', '>=', $termStart->copy()->subDays(6)->toDateString())
                ->get(['student_id', 'week_start'])
                ->mapWithKeys(fn ($submission) => [
                    $submission->student_id . '|' . $submission->week_start->toDateString() => true,
                ]);
        }

        $lastCompletedWeekStart = $today->copy()->startOfWeek()->subWeek();
        if ($termEnd && $termEnd->copy()->startOfWeek()->lt($lastCompletedWeekStart)) {
            $lastCompletedWeekStart = $termEnd->copy()->startOfWeek();
        }

        $missingLogbookStudents = $internshipStudents
            ->map(function ($student) use ($lastCompletedWeekStart, $termStart, $termEnd, $submittedWeekKeys, $formatProgressStudent) {
                $internship = $student->internship;
                if (!$internship || !$termStart || !$termEnd) {
                    return null;
                }
                $firstDay = $internship->start_date->gt($termStart)
                    ? $internship->start_date->copy()
                    : $termStart->copy();
                $lastDay = $internship->end_date->lt($termEnd)
                    ? $internship->end_date->copy()
                    : $termEnd->copy();
                $weekStart = $firstDay->copy()->startOfWeek();
                $missingWeeks = [];

                while ($weekStart->lte($lastCompletedWeekStart) && $weekStart->lte($lastDay)) {
                    $weekEnd = $weekStart->copy()->endOfWeek();
                    if ($weekEnd->gte($termStart) && $weekStart->lte($termEnd)) {
                        $weekKey = $student->student_id . '|' . $weekStart->toDateString();
                        if (!$submittedWeekKeys->has($weekKey)) {
                            $missingWeeks[] = $weekStart->toDateString();
                        }
                    }
                    $weekStart->addWeek();
                }

                if ($missingWeeks === []) {
                    return null;
                }

                return array_merge($formatProgressStudent($student), [
                    'missing_weeks' => count($missingWeeks),
                    'oldest_missing_week' => $missingWeeks[0],
                ]);
            })
            ->filter()
            ->sortByDesc('missing_weeks')
            ->values();

        $missingLogbookWeeks = $missingLogbookStudents->sum('missing_weeks');
        $approachingCompletionStudents = $internshipStudents
            ->filter(fn ($student) => $student->internship->end_date->between($today, $today->copy()->addWeeks(4)))
            ->map($formatProgressStudent)
            ->sortBy('end_date')
            ->values();

        $weeklyLogbooks = LogbookWeeklySubmission::query()
            ->when($termStart && $termEnd, fn ($query) => $query
                ->whereDate('week_start', '<=', $termEnd->toDateString())
                ->whereDate('week_start', '>=', $termStart->copy()->subDays(6)->toDateString()))
            ->whereIn('student_id', $cohort->pluck('student_id'));
        $weeklyLogbooksAwaitingReview = (clone $weeklyLogbooks)->whereIn('status', ['submitted', 'pending'])->count();
        $weeklyLogbooksApproved = (clone $weeklyLogbooks)->where('status', 'approved')->count();
        $weeklyLogbooksNeedingFixes = (clone $weeklyLogbooks)->where('status', 'pending_fix')->count();

        $availableQuotas = PlacementQuota::available()
            ->where('academic_semester_id', $selectedSemester ?? 0)
            ->get()
            ->sum(fn ($quota) => $quota->remaining_slots);

        $placementRate = $totalStudents > 0 ? round(($placedStudents / $totalStudents) * 100) : 0;

        $activities = Application::query()
            ->with(['student', 'quota.company'])
            ->whereHas('quota', fn ($query) => $query->where('academic_semester_id', $selectedSemester ?? 0))
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($application) {
                $nameParts = preg_split('/\s+/', trim($application->student?->full_name ?? ''));
                $initials = collect($nameParts)->filter()->take(2)
                    ->map(fn ($name) => strtoupper(substr($name, 0, 1)))
                    ->implode('');

                return [
                    'id' => $application->id,
                    'initials' => $initials,
                    'student_name' => $application->student?->full_name ?? 'Unknown Student',
                    'company_name' => $application->quota?->company?->company_name ?? 'Unknown Company',
                    'status' => $application->app_status,
                    'date' => $application->updated_at?->diffForHumans(),
                ];
            });

        $interventionStudents = $internshipStudents
            ->map(function ($student) use ($formatProgressStudent) {
                $statuses = $student->programme?->academicSupervisorAssignments->pluck('monitoring_status') ?? collect();
                if (!$statuses->contains(fn ($status) => in_array($status, ['Needs Attention', 'At Risk'], true))) {
                    return null;
                }

                return array_merge($formatProgressStudent($student), [
                    'monitoring_status' => $statuses->contains('At Risk') ? 'At Risk' : 'Needs Attention',
                ]);
            })
            ->filter()
            ->sortBy(fn ($student) => $student['monitoring_status'] === 'At Risk' ? 0 : 1)
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending_companies' => $pendingCompanies,
                'pending_quotas' => $pendingQuotas,
                'total_students' => $totalStudents,
                'unplaced_students' => $unplacedStudents,
                'accepted_students' => $placedStudents,
                'available_quotas' => $availableQuotas,
                'placement_rate' => $placementRate,
                'weekly_logbooks_awaiting_review' => $weeklyLogbooksAwaitingReview,
                'weekly_logbooks_approved' => $weeklyLogbooksApproved,
                'weekly_logbooks_needing_fixes' => $weeklyLogbooksNeedingFixes,
                'missing_logbooks' => $missingLogbookStudents->count(),
                'missing_logbook_weeks' => $missingLogbookWeeks,
                'approaching_completion' => $approachingCompletionStudents->count(),
                'requiring_intervention' => $interventionStudents->count(),
            ],
            'progress' => [
                'current_internships' => $internshipStudents->map($formatProgressStudent)->values(),
                'missing_logbooks' => $missingLogbookStudents,
                'approaching_completion' => $approachingCompletionStudents,
                'requiring_intervention' => $interventionStudents,
            ],
            'availableSemesters' => $semesters->map(fn ($semester) => [
                'id' => (int) $semester->id,
                'name' => $semester->name,
                'starts_on' => $semester->starts_on->toDateString(),
                'ends_on' => $semester->ends_on->toDateString(),
            ]),
            'selectedSemester' => $selectedSemester,
            'selectedSemesterName' => $selectedTerm?->name,
            'activities' => $activities,
        ]);
    }
}
