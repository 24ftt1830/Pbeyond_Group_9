<?php

namespace App\Services;

use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Support\BruneiDate;
use Illuminate\Support\Carbon;

class LogbookTracking
{
    private const APPROVED_STATUSES = ['approved', 'reviewed'];

    /** The first internship week that has not yet been approved. */
    public function firstUnapprovedWeekStart(Student $student): ?string
    {
        $internship = $student->internship;
        if (!$internship || !$student->applications()->where('app_status', 'Recruited')->exists()) {
            return null;
        }

        $submissions = LogbookWeeklySubmission::where('student_id', $student->student_id)
            ->get()->keyBy(fn ($week) => $week->week_start->toDateString());

        for ($week = $internship->start_date->copy()->startOfWeek(); $week->lte($internship->end_date); $week->addWeek()) {
            $submission = $submissions->get($week->toDateString());
            if (!$submission || $submission->date_change_review_required
                || !in_array($submission->status, self::APPROVED_STATUSES, true)) {
                return $week->toDateString();
            }
        }

        return null;
    }

    /** A week can be submitted or approved only after every earlier week is approved. */
    public function previousWeeksApproved(Student $student, Carbon|string $weekStart): bool
    {
        $internship = $student->internship;
        if (!$internship || !$student->applications()->where('app_status', 'Recruited')->exists()) {
            return false;
        }

        $target = Carbon::parse($weekStart)->startOfWeek()->startOfDay();
        $submissions = LogbookWeeklySubmission::where('student_id', $student->student_id)
            ->get()->keyBy(fn ($week) => $week->week_start->toDateString());

        for ($week = $internship->start_date->copy()->startOfWeek(); $week->lt($target); $week->addWeek()) {
            $submission = $submissions->get($week->toDateString());
            if (!$submission || $submission->date_change_review_required
                || !in_array($submission->status, self::APPROVED_STATUSES, true)) {
                return false;
            }
        }

        return true;
    }

    /** Missing completed weeks, including the final partial week after internship end. */
    public function missingWeeks(Student $student): array
    {
        $internship = $student->internship;
        if (!$internship || !$student->applications()->where('app_status', 'Recruited')->exists()) {
            return [];
        }
        $submitted = LogbookWeeklySubmission::where('student_id', $student->student_id)->get()
            ->keyBy(fn ($week) => $week->week_start->toDateString());
        $missing = [];
        $attendance = app(AttendanceService::class);
        for ($week = $internship->start_date->copy()->startOfWeek(); $week->lte($internship->end_date); $week->addWeek()) {
            $start = $week->copy()->max($internship->start_date);
            $end = $week->copy()->endOfWeek()->startOfDay()->min($internship->end_date);
            $dates = $attendance->periodDates($start, $end);
            if (!$dates || BruneiDate::isAfterToday(end($dates))) {
                continue;
            }
            if (!$submitted->has($week->toDateString())) {
                $missing[] = ['week_start' => $week->toDateString(), 'week_end' => $week->copy()->endOfWeek()->toDateString()];
            }
        }

        return $missing;
    }
}
