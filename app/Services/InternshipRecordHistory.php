<?php

namespace App\Services;

use App\Models\AdminRecordChange;
use App\Models\InternshipCompletion;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;

class InternshipRecordHistory
{
    public function for(Student $student): Collection
    {
        $completionId = $student->internshipCompletion?->getKey();
        $weeks = LogbookWeeklySubmission::where('student_id', $student->student_id)->get()->keyBy('id');
        $history = AdminRecordChange::with('actor:user_id,username,role')
            ->where(function ($query) use ($completionId, $weeks) {
                $query->where(function ($query) use ($completionId) {
                    $query->where('subject_type', (new InternshipCompletion)->getMorphClass())
                        ->where('subject_id', $completionId ?? 0)
                        ->whereIn('action', ['Updated final internship decision', 'Final completion reopened for logbook correction']);
                })->orWhere(function ($query) use ($weeks) {
                    $query->where('subject_type', (new LogbookWeeklySubmission)->getMorphClass())
                        ->whereIn('subject_id', $weeks->keys())
                        ->whereIn('action', ['Reopened logbook for student correction', 'Resubmitted corrected logbook week', 'Approved corrected logbook week', 'Requested further logbook corrections']);
                });
            })->orderByDesc('id')->get();

        $previousActors = User::whereIn('user_id', $history->pluck('before_snapshot.academic_decided_by_user_id')->filter())
            ->pluck('username', 'user_id');

        return $history->map(function (AdminRecordChange $change) use ($weeks, $previousActors) {
            $before = $change->before_snapshot ?? [];
            $after = $change->after_snapshot ?? [];
            $isWeek = $change->subject_type === (new LogbookWeeklySubmission)->getMorphClass();
            $week = $isWeek ? $weeks->get($change->subject_id) : null;

            return [
                'id' => $change->id,
                'action' => $change->action,
                'actor' => $change->actor?->username ?? 'System update',
                'actor_role' => $change->actor?->role === 'Admin' ? 'Superadmin' : $change->actor?->role,
                'created_at' => $change->created_at?->toIso8601String(),
                'previous_status' => $isWeek ? ($before['status'] ?? null) : ($before['academic_completion_status'] ?? null),
                'current_status' => $isWeek ? ($after['status'] ?? null) : ($after['academic_completion_status'] ?? null),
                'reason' => data_get($after, '_workflow.reason') ?? ($after['reopen_reason'] ?? null),
                'week_start' => $week?->week_start?->toDateString(),
                'week_end' => $week?->week_end?->toDateString(),
                'previous_decided_by' => $isWeek ? null : $previousActors->get($before['academic_decided_by_user_id'] ?? 0),
                'previous_decided_at' => !$isWeek && !empty($before['academic_completion_decided_at'])
                    ? Carbon::parse($before['academic_completion_decided_at'])->toIso8601String() : null,
            ];
        });
    }
}
