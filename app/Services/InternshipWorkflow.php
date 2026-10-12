<?php

namespace App\Services;

use App\Models\AcademicSupervisor;
use App\Models\AdminRecordChange;
use App\Models\Application;
use App\Models\IndustrySupervisor;
use App\Models\InternshipCompletion;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InternshipWorkflow
{
    public function dates(Student $student, array $dates, User $actor): void
    {
        if (!$student->applications()->where('app_status', 'Recruited')->exists()) {
            throw ValidationException::withMessages(['start_date' => 'Recruit the student before setting internship dates.']);
        }

        DB::transaction(function () use ($student, $dates, $actor) {
            $before = $student->internship?->toArray();
            $internship = $student->internship()->updateOrCreate([], $dates);
            AdminRecordChange::record($actor, $internship, 'Updated internship dates', $before);
        });
    }

    public function application(Application $application, array $data, User $actor): void
    {
        DB::transaction(function () use ($application, $data, $actor) {
            $quota = $application->quota()->lockForUpdate()->firstOrFail();
            $application->refresh();
            if ($data['status'] === 'Recruited' && $application->app_status !== 'Recruited'
                && $quota->applications()->where('id', '!=', $application->getKey())
                    ->whereIn('app_status', ['Recruited', 'Approved'])->count() >= $quota->total_slots) {
                throw ValidationException::withMessages(['status' => 'This job position has no remaining recruitment slots.']);
            }
            $before = $application->toArray();
            $previousStatus = $application->app_status;
            $application->update([
                'app_status' => $data['status'],
                'interview_date' => $data['status'] === 'Interviewing' ? ($data['interview_date'] ?? $application->interview_date) : null,
            ]);
            if ($previousStatus !== $data['status'] && in_array('Recruited', [$previousStatus, $data['status']], true)) {
                $application->student->internshipCompletion?->resetAcademicDecision();
            }
            AdminRecordChange::record($actor, $application, 'Updated application status', $before);
        });
    }

    public function confirmCompany(Student $student, string $status, User $actor, ?IndustrySupervisor $supervisor = null): void
    {
        if (!$student->applications()->where('app_status', 'Recruited')->exists()) {
            throw ValidationException::withMessages(['status' => 'Company confirmation requires a recruited student.']);
        }
        DB::transaction(function () use ($student, $status, $actor, $supervisor) {
            $record = InternshipCompletion::firstOrNew(['student_id' => $student->student_id]);
            $before = $record->exists ? $record->toArray() : null;
            $record->fill([
                'industry_confirmation_status' => $status,
                'industry_supervisor_id' => $supervisor?->supervisor_id,
                'industry_decided_by_user_id' => $actor->getKey(),
                'industry_reviewed_at' => now(),
                'industry_confirmed_at' => $status === 'Confirmed' ? now() : null,
                'academic_completion_status' => 'Pending Evaluation',
                'academic_supervisor_id' => null,
                'academic_decided_by_user_id' => null,
                'academic_completion_decided_at' => null,
            ])->save();
            AdminRecordChange::record($actor, $record, 'Updated company internship completion', $before);
        });
    }

    public function decide(Student $student, string $decision, User $actor, ?AcademicSupervisor $supervisor = null): void
    {
        if (!app(InternshipCompletionStatus::class)->canAcademicFinalize($student->fresh(), $decision)) {
            throw ValidationException::withMessages(['decision' => $decision === 'Completed'
                ? 'Completion requires company confirmation, both submitted supervisor evaluations, and an approved and marked written report.'
                : 'A final decision requires a company decision, both submitted supervisor evaluations, and a reviewed written report.']);
        }
        DB::transaction(function () use ($student, $decision, $actor, $supervisor) {
            $record = InternshipCompletion::firstOrNew(['student_id' => $student->student_id]);
            $before = $record->exists ? $record->toArray() : null;
            $record->fill([
                'academic_completion_status' => $decision,
                'academic_supervisor_id' => $supervisor?->academic_supervisor_id,
                'academic_decided_by_user_id' => $actor->getKey(),
                'academic_completion_decided_at' => now(),
            ])->save();
            AdminRecordChange::record($actor, $record, 'Updated final internship decision', $before);
        });
    }
}
