<?php

namespace App\Services;

use App\Models\LogbookEntry;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Support\BruneiDate;
use App\Support\LogbookTesting;
use Illuminate\Support\Carbon;

class AttendanceService
{
    public function periodDates(Carbon $start, Carbon $end): array
    {
        $dates = [];
        for ($date = $start->copy()->startOfDay(); $date->lte($end); $date->addDay()) {
            $dates[] = $date->toDateString();
        }

        return $dates;
    }

    public function summary(Student $student): array
    {
        $internship = $student->internship;
        $includeFutureDays = LogbookTesting::allowsFutureDates();
        $result = ['total_days' => 0, 'elapsed_days' => 0, 'recorded_days' => 0,
            'credited_days' => 0, 'absent_days' => 0, 'missing_days' => 0,
            'unapproved_days' => 0, 'percentage' => null,
            'includes_future_days' => $includeFutureDays, 'future_approved_days' => 0];
        if (!$internship) {
            return $result;
        }
        $dates = $this->periodDates($internship->start_date, $internship->end_date);
        $elapsed = array_values(array_filter($dates, fn (string $date) => !BruneiDate::isAfterToday($date)));
        $attendanceDates = $includeFutureDays ? $dates : $elapsed;
        $approvedWeeks = LogbookWeeklySubmission::where('student_id', $student->student_id)
            ->whereIn('status', ['approved', 'reviewed'])
            ->where('date_change_review_required', false)
            ->get()->keyBy(fn ($week) => $week->week_start->toDateString());
        $entries = LogbookEntry::where('student_id', $student->student_id)->whereIn('date', $attendanceDates)->get()
            ->keyBy(fn ($entry) => $entry->date->toDateString());
        foreach ($attendanceDates as $date) {
            $weekStart = Carbon::parse($date)->startOfWeek()->toDateString();
            $approved = $approvedWeeks->has($weekStart);
            $status = $entries->get($date)?->status;

            // Demo attendance includes approved future records, without treating
            // future unrecorded or unapproved days as missing attendance.
            if ($includeFutureDays && BruneiDate::isAfterToday($date)) {
                if (!$approved || !in_array($status, ['working', 'permission', 'holiday', 'off', 'absent'], true)) {
                    continue;
                }
                $result['future_approved_days']++;
            }

            if (!$approved) {
                if ($entries->has($date)) {
                    $result['unapproved_days']++;
                } else {
                    $result['missing_days']++;
                }
                continue;
            }

            if (in_array($status, ['working', 'permission', 'holiday', 'off'], true)) {
                $result['credited_days']++;
                $result['recorded_days']++;
            } elseif ($status === 'absent') {
                $result['absent_days']++;
                $result['recorded_days']++;
            } else {
                $result['missing_days']++;
            }
        }
        $result['total_days'] = count($dates);
        $result['elapsed_days'] = count($elapsed);
        $result['percentage'] = $result['recorded_days'] ? round($result['credited_days'] / $result['recorded_days'] * 100, 1) : null;

        return $result;
    }
}
