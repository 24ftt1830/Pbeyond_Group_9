<?php

namespace App\Http\Controllers\AcademicSupervisor;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\AdminRecordChange;
use App\Models\IndustrySupervisor;
use App\Models\LogbookEntry;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Services\AttendanceService;
use App\Services\LogbookTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index(Request $request)
    {
        $students = $this->assignedStudents($request)->with('internship')->orderBy('students.full_name')->get();
        $submissions = LogbookWeeklySubmission::with('student')->whereIn('student_id', $students->pluck('student_id'))
            ->latest('submitted_at')->get();
        $missing = $students->map(function (Student $student) {
            $weeks = app(LogbookTracking::class)->missingWeeks($student);
            return $weeks ? [
                'student_id' => $student->student_id, 'full_name' => $student->full_name,
                'pb_student_code' => $student->pb_student_code, 'missing_weeks' => $weeks,
            ] : null;
        })->filter()->values();

        return Inertia::render('AcademicSupervisor/Logbook', [
            'pendingSubmissions' => $submissions->filter(fn ($week) =>
                $week->date_change_review_required || !in_array($week->status, ['approved', 'reviewed'], true))->values(),
            'reviewedSubmissions' => $submissions->filter(fn ($week) =>
                !$week->date_change_review_required && in_array($week->status, ['approved', 'reviewed'], true))->values(),
            'missingLogbooks' => $missing,
            'canReview' => $request->user()->role === 'Industry Supervisor',
            'viewer' => $request->user()->role === 'Industry Supervisor' ? 'industry' : 'academic',
        ]);
    }

    public function review(Request $request, LogbookWeeklySubmission $submission)
    {
        abort_unless($this->assignedStudents($request)->where('students.student_id', $submission->student_id)->exists(), 403);
        $student = $submission->student;
        $student->loadMissing('internship');
        $entries = LogbookEntry::where('student_id', $submission->student_id)
            ->whereBetween('date', [$submission->week_start->toDateString(), $submission->week_end->toDateString()])
            ->orderBy('date')->get()->map(fn ($entry) => array_merge($entry->toArray(), ['attachments' => collect($entry->attachments ?? [])->map(fn ($file) => [
                'id' => $file['id'], 'name' => $file['name'], 'mime' => $file['mime'], 'size' => $file['size'],
                'url' => route('logbook.attachments.download', [$entry->id, $file['id']]),
            ])->all()]));

        return Inertia::render('AcademicSupervisor/LogbookReview', [
            'submission' => $submission, 'student' => $student->only(['student_id', 'full_name', 'pb_student_code']),
            'entries' => $entries, 'adminContext' => $request->user()->role === 'Admin',
            'canReview' => in_array($request->user()->role, ['Admin', 'Industry Supervisor'], true),
            'dateChangeWeekOutsideRange' => $submission->date_change_review_required
                && $student->internship
                && ($submission->week_start->copy()->max($student->internship->start_date)
                    ->gt($submission->week_end->copy()->min($student->internship->end_date))),
            'viewer' => match ($request->user()->role) {'Admin' => 'admin', 'Industry Supervisor' => 'industry', default => 'academic'},
            'attendance' => app(AttendanceService::class)->summary($student),
        ]);
    }

    public function markReviewed(Request $request, LogbookWeeklySubmission $submission)
    {
        abort_unless(in_array($request->user()->role, ['Admin', 'Industry Supervisor'], true), 403);
        abort_unless($this->assignedStudents($request)->where('students.student_id', $submission->student_id)->exists(), 403);
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'pending_fix'])],
            'supervisor_feedback' => ['nullable', 'string', 'max:10000', 'required_if:status,pending_fix'],
            'flagged_entries' => ['nullable', 'array'],
            'flagged_entries.*' => ['integer', 'distinct', Rule::exists('logbook_entries', 'id')->where('student_id', $submission->student_id)
                ->where(fn ($query) => $query->whereBetween('date', [$submission->week_start->toDateString(), $submission->week_end->toDateString()]))],
        ]);
        DB::transaction(function () use ($request, $submission, $data) {
            $student = Student::whereKey($submission->student_id)->lockForUpdate()->firstOrFail();
            abort_unless($this->assignedStudents($request)->where('students.student_id', $student->student_id)->exists(), 403);
            $week = LogbookWeeklySubmission::whereKey($submission->id)->lockForUpdate()->firstOrFail();
            // Corrections must first be resubmitted by the student; approved weeks require Admin reopening.
            $dateChangeReview = (bool) $week->date_change_review_required;
            if (!in_array($week->status, ['submitted', 'pending'], true) && !$dateChangeReview) {
                throw ValidationException::withMessages(['status' => 'Only a submitted week can be reviewed. Reopen approved weeks before making corrections.']);
            }
            if ($data['status'] === 'approved') {
                if (!$student->internship || !$student->applications()->where('app_status', 'Recruited')->exists()) {
                    throw ValidationException::withMessages(['status' => 'The student needs an active placement and internship dates.']);
                }
                $start = $week->week_start->copy()->max($student->internship->start_date);
                $end = $week->week_end->copy()->min($student->internship->end_date);
                if ($start->gt($end) && !$dateChangeReview) {
                    throw ValidationException::withMessages(['status' => 'This week is outside the completed internship dates.']);
                }
                if ($start->lte($end)) {
                    if (!app(LogbookTracking::class)->previousWeeksApproved($student, $week->week_start)) {
                        throw ValidationException::withMessages(['status' => 'Approve every earlier internship week before approving this week.']);
                    }
                    $dates = app(AttendanceService::class)->periodDates($start, $end);
                    $entries = LogbookEntry::where('student_id', $student->student_id)->whereIn('date', $dates)->get();
                    if (!$dates || end($dates) > now()->toDateString() || $entries->count() !== count($dates) || $entries->contains(fn ($entry) =>
                        !in_array($entry->status, ['working', 'permission', 'absent', 'holiday'], true)
                        || ($entry->status === 'working' && (blank($entry->description) || blank($entry->learning_outcomes)))
                        || ($entry->status === 'permission' && !$entry->legacy_permission && empty($entry->attachments))
                    )) {
                        throw ValidationException::withMessages(['status' => 'This week is incomplete. Request corrections before approval.']);
                    }
                }
            }
            if ($dateChangeReview && $data['status'] === 'pending_fix') {
                if (!$student->internship) {
                    throw ValidationException::withMessages(['status' => 'This saved week is outside the updated internship dates and cannot be sent back to the student for editing.']);
                }
                $start = $week->week_start->copy()->max($student->internship->start_date);
                $end = $week->week_end->copy()->min($student->internship->end_date);
                if ($start->gt($end)) {
                    throw ValidationException::withMessages(['status' => 'This saved week is outside the updated internship dates and cannot be sent back to the student for editing.']);
                }
            }
            $before = $week->toArray();
            $review = [
                'supervisor_feedback' => $data['supervisor_feedback'] ?? null,
                'flagged_entries' => $data['status'] === 'approved' ? [] : ($data['flagged_entries'] ?? []),
            ];
            if ($dateChangeReview) {
                $review['date_change_review_required'] = $data['status'] !== 'approved';
                $review['date_change_reviewed_at'] = now();
                $review['date_change_reviewer_user_id'] = $request->user()->getKey();
                $review['status'] = $data['status'];
                if ($week->reviewed_at === null) {
                    $review['reviewed_at'] = now();
                    $review['reviewer_user_id'] = $request->user()->getKey();
                    $review['reviewer_role'] = $request->user()->role;
                }
            } else {
                $review['status'] = $data['status'];
                $review['reviewed_at'] = now();
                $review['reviewer_user_id'] = $request->user()->getKey();
                $review['reviewer_role'] = $request->user()->role;
            }
            $week->forceFill($review)->save();
            AdminRecordChange::record($request->user(), $week, 'Reviewed weekly logbook', $before);
        });

        return redirect($request->user()->role === 'Admin'
            ? route('admin.students.show', $submission->student_id)
            : route('industry-supervisor.logbook'))->with('success', 'Logbook review saved.');
    }

    private function assignedStudents(Request $request)
    {
        if ($request->user()->role === 'Admin') {
            return Student::query();
        }
        if ($request->user()->role === 'Industry Supervisor') {
            $supervisor = IndustrySupervisor::where('user_id', $request->user()->getKey())->firstOrFail();
            return $supervisor->students();
        }
        abort_unless($request->user()->role === 'Academic Supervisor', 403);
        $supervisor = AcademicSupervisor::where('user_id', $request->user()->getKey())->firstOrFail();
        return Student::whereHas('academicSupervisorAssignments', fn ($query) =>
            $query->where('academic_supervisor_id', $supervisor->academic_supervisor_id));
    }
}
