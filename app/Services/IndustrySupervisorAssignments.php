<?php

namespace App\Services;

use App\Models\AdminRecordChange;
use App\Models\IndustrySupervisor;
use App\Models\Student;
use App\Models\SupervisorAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class IndustrySupervisorAssignments
{
    public function sync(IndustrySupervisor $supervisor, array $studentIds, User $actor): void
    {
        DB::transaction(function () use ($supervisor, $studentIds, $actor) {
            $studentIds = collect($studentIds)->map(fn ($id) => (int) $id)->unique()->sort()->values();
            $before = $supervisor->assignments()->pluck('student_id');
            $allIds = $before->merge($studentIds)->unique()->sort()->values();
            $students = Student::whereIn('student_id', $allIds)->orderBy('student_id')->lockForUpdate()->get();
            $eligibleIds = Student::whereIn('student_id', $studentIds)
                ->whereHas('applications', fn ($query) => $query->where('app_status', 'Recruited')
                    ->whereHas('quota', fn ($quota) => $quota->where('company_id', $supervisor->company_id)))
                ->pluck('student_id');
            if ($studentIds->diff($eligibleIds)->isNotEmpty()) {
                throw ValidationException::withMessages(['student_ids' => 'Choose only students currently recruited by this company.']);
            }
            if (SupervisorAssignment::whereIn('student_id', $studentIds)
                ->where('supervisor_id', '<>', $supervisor->supervisor_id)->exists()) {
                throw ValidationException::withMessages(['student_ids' => 'A selected student already has an Industry Supervisor. Remove that assignment before assigning another supervisor.']);
            }
            $supervisor->assignments()->whereNotIn('student_id', $studentIds)->delete();
            foreach ($studentIds as $studentId) {
                $supervisor->assignments()->firstOrCreate(['student_id' => $studentId]);
            }
            $changedIds = $before->diff($studentIds)->merge($studentIds->diff($before));
            foreach ($students->whereIn('student_id', $changedIds) as $student) {
                $student->internshipCompletion?->resetAcademicDecision();
            }
            AdminRecordChange::record($actor, $supervisor, 'Updated Industry Supervisor student assignments', ['student_ids' => $before->all()]);
        });
    }
}
