<?php

namespace App\Services;

use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use Illuminate\Support\Carbon;

class LogbookTracking
{
    /**
     * Return completed calendar weeks in the student's internship period that
     * do not yet have a weekly submission.
     *
     * @return array<int, array{week_start: string, week_end: string}>
     */
    public function missingWeeks(Student $student): array
    {
        $internship = $student->internship;

        if (!$internship || !$student->applications()->where('app_status', 'Recruited')->exists()) {
            return [];
        }

        $lastCompletedWeekStart = now()->startOfWeek()->subWeek();
        $weekStart = $internship->start_date->copy()->startOfWeek();

        if ($weekStart->gt($lastCompletedWeekStart)) {
            return [];
        }

        $submittedWeekStarts = LogbookWeeklySubmission::query()
            ->where('student_id', $student->student_id)
            ->whereBetween('week_start', [
                $weekStart->toDateString(),
                $lastCompletedWeekStart->toDateString(),
            ])
            ->pluck('week_start')
            ->map(fn ($date) => Carbon::parse($date)->startOfWeek()->toDateString())
            ->flip();

        $missingWeeks = [];

        while ($weekStart->lte($lastCompletedWeekStart) && $weekStart->lte($internship->end_date)) {
            $weekKey = $weekStart->toDateString();

            if (!$submittedWeekStarts->has($weekKey)) {
                $missingWeeks[] = [
                    'week_start' => $weekKey,
                    'week_end' => $weekStart->copy()->endOfWeek()->toDateString(),
                ];
            }

            $weekStart->addWeek();
        }

        return $missingWeeks;
    }
}
