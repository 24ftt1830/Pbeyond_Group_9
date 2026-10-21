<?php

namespace App\Services;

use App\Models\AcademicSupervisor;
use App\Models\AcademicSemester;
use App\Models\AdminRecordChange;
use App\Models\Application;
use App\Models\IndustrySupervisor;
use App\Models\InternshipCompletion;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Models\User;
use App\Notifications\ApplicationDecisionNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class InternshipWorkflow
{
    public function dates(Student $student, array $dates, User $actor): void
    {
        if (!$student->applications()->where('app_status', 'Recruited')->exists()) {
            throw ValidationException::withMessages(['start_date' => 'Recruit the student before setting internship dates.']);
        }

        if ($actor->role !== 'Admin') {
            $semester = AcademicSemester::internshipTermForIntake((int) $student->intake_semester_id);

            if (!$semester) {
                throw ValidationException::withMessages([
                    'start_date' => 'Ask Admin to assign this student’s intake and configure their semester 5 period before setting internship dates.',
                ]);
            }

            $earliestDate = $semester->starts_on->copy()->startOfDay()->addDay();
            $latestDate = $semester->ends_on->copy()->startOfDay();
            $allowedRange = $earliestDate->format('j M Y') . ' to ' . $latestDate->format('j M Y');
            $errors = [];

            foreach (['start_date' => 'Start date', 'end_date' => 'End date'] as $field => $label) {
                $date = Carbon::parse($dates[$field])->startOfDay();

                if ($date->lt($earliestDate) || $date->gt($latestDate)) {
                    $errors[$field] = "{$label} must be after the school's semester start and within semester 5 ({$semester->name}): {$allowedRange}. Contact Admin for dates outside this period.";
                }
            }

            if ($errors !== []) {
                throw ValidationException::withMessages($errors);
            }
        }

        DB::transaction(function () use ($student, $dates, $actor) {
            $currentInternship = $student->internship;
            $before = $currentInternship?->toArray();
            $dateChanged = $currentInternship !== null
                && ($currentInternship->start_date->toDateString() !== $dates['start_date']
                    || $currentInternship->end_date->toDateString() !== $dates['end_date']);
            $internship = $student->internship()->updateOrCreate([], $dates);
            AdminRecordChange::record($actor, $internship, 'Updated internship dates', $before);

            if ($dateChanged) {
                $affectedWeeks = LogbookWeeklySubmission::where('student_id', $student->student_id)
                    ->whereExists(function ($query) use ($dates) {
                        $query->selectRaw('1')
                            ->from('logbook_entries')
                            ->whereColumn('logbook_entries.student_id', 'logbook_weekly_submissions.student_id')
                            ->whereColumn('logbook_entries.date', '>=', 'logbook_weekly_submissions.week_start')
                            ->whereColumn('logbook_entries.date', '<=', 'logbook_weekly_submissions.week_end')
                            ->where(function ($query) use ($dates) {
                                $query->where('logbook_entries.date', '<', $dates['start_date'])
                                    ->orWhere('logbook_entries.date', '>', $dates['end_date']);
                            });
                    })->get();

                foreach ($affectedWeeks as $week) {
                    $week->forceFill([
                        'date_change_review_required' => true,
                        'date_change_reviewed_at' => null,
                        'date_change_reviewer_user_id' => null,
                    ])->save();
                }

                $student->internshipCompletion?->resetAcademicDecision();
            }
        });
    }

    public function application(Application $application, array $data, User $actor): void
    {
        DB::transaction(function () use ($application, $data, $actor) {
            $student = Student::whereKey($application->student_id)->lockForUpdate()->firstOrFail();
            $quota = $application->quota()->lockForUpdate()->firstOrFail();
            $application->refresh();
            if ($actor->role === 'Company' && $application->app_status === 'Cancelled') {
                throw ValidationException::withMessages([
                    'status' => 'This application was cancelled by the student and can no longer be updated by Company HR.',
                ]);
            }
            if ($actor->role === 'Company' && $application->hasFinalDecision()) {
                throw ValidationException::withMessages([
                    'status' => 'This application has a final decision and cannot be changed by Company HR. Email Admin directly to request a change.',
                ]);
            }
            if (in_array($data['status'], Application::ACTIVE_STATUSES, true)
                && $student->applications()->where('id', '<>', $application->id)
                    ->whereIn('app_status', Application::ACTIVE_STATUSES)->exists()) {
                throw ValidationException::withMessages(['status' => 'This student already has an active application or recruited placement. Resolve it before reopening this application.']);
            }
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
            if ($previousStatus !== $data['status']) {
                $application->statusHistories()->create([
                    'from_status' => $previousStatus,
                    'to_status' => $data['status'],
                    'changed_by_user_id' => $actor->getKey(),
                ]);
            }
            if ($previousStatus !== $data['status'] && in_array('Recruited', [$previousStatus, $data['status']], true)) {
                $application->student->internshipCompletion?->resetAcademicDecision();
                if ($previousStatus === 'Recruited') {
                    $student->supervisorAssignments()->delete();
                    $student->internshipCompletion?->update([
                        'industry_confirmation_status' => 'Pending Confirmation',
                        'industry_supervisor_id' => null,
                        'industry_reviewed_at' => null,
                        'industry_confirmed_at' => null,
                        'industry_decided_by_user_id' => null,
                    ]);
                }
            }
            AdminRecordChange::record($actor, $application, 'Updated application status', $before);
            if ($previousStatus !== $data['status'] && in_array($data['status'], ['Recruited', 'Declined'], true)) {
                $student->user?->notify(new ApplicationDecisionNotification($data['status'], $application));
            }
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
        DB::transaction(function () use ($student, $decision, $actor, $supervisor) {
            $student = Student::whereKey($student->getKey())->lockForUpdate()->firstOrFail();
            $status = app(InternshipCompletionStatus::class);
            if ($decision === 'Completed' && $status->hasUnresolvedLogbookCorrections($student)) {
                throw ValidationException::withMessages(['decision' => 'Logbook correction pending. The student must resubmit every reopened week and obtain approval before PB Supervisor can confirm completion again.']);
            }
            if (!$status->canAcademicFinalize($student, $decision)) {
                throw ValidationException::withMessages(['decision' => $decision === 'Completed'
                    ? 'Completion requires company confirmation, both submitted supervisor evaluations, and an approved and marked written report.'
                    : 'A final decision requires a company decision, both submitted supervisor evaluations, and a reviewed written report.']);
            }
            $record = InternshipCompletion::firstOrNew(['student_id' => $student->student_id]);
            $before = $record->exists ? $record->toArray() : null;
            $record->fill([
                'academic_completion_status' => $decision,
                'academic_supervisor_id' => $supervisor?->academic_supervisor_id,
                'academic_decided_by_user_id' => $actor->getKey(),
                'academic_completion_decided_at' => now(),
            ])->save();
            AdminRecordChange::recordWorkflow($actor, $record, 'Updated final internship decision', $before);
        });
    }
}
