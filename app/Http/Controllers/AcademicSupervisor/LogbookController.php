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
use App\Support\BruneiDate;
use App\Support\LogbookTesting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index(Request $request)
    {
        $students = $this->assignedStudents($request)->with('internship')
            ->orderBy('students.full_name')->orderBy('students.student_id')
            ->get(['students.student_id', 'students.full_name', 'students.pb_student_code']);
        $submissionsByStudent = LogbookWeeklySubmission::whereIn('student_id', $students->pluck('student_id'))
            ->get(['student_id', 'status', 'date_change_review_required'])->groupBy('student_id');
        $studentRows = $students->map(function (Student $student) use ($submissionsByStudent) {
            $submissions = $submissionsByStudent->get($student->student_id, collect());

            return [
                'student_id' => $student->student_id, 'full_name' => $student->full_name,
                'pb_student_code' => $student->pb_student_code,
                'pending_count' => $submissions->filter(fn ($week) =>
                    $week->date_change_review_required || in_array($week->status, ['submitted', 'pending'], true))->count(),
                'approved_count' => $submissions->filter(fn ($week) =>
                    !$week->date_change_review_required && in_array($week->status, ['approved', 'reviewed'], true))->count(),
                'missing_count' => count(app(LogbookTracking::class)->missingWeeks($student)),
                'total_submissions' => $submissions->count(),
            ];
        })->values();

        return Inertia::render('AcademicSupervisor/Logbook', [
            'students' => $studentRows,
            'stats' => [
                'pending' => $studentRows->sum('pending_count'),
                'approved' => $studentRows->sum('approved_count'),
                'total' => $studentRows->sum('total_submissions'),
            ],
            'canReview' => $request->user()->role === 'Industry Supervisor',
            'viewer' => $request->user()->role === 'Industry Supervisor' ? 'industry' : 'academic',
        ]);
    }

    public function student(Request $request, Student $student)
    {
        abort_unless($this->assignedStudents($request)->where('students.student_id', $student->student_id)->exists(), 403);
        $student->loadMissing('internship');

        return Inertia::render('AcademicSupervisor/LogbookStudent', [
            'student' => $student->only(['student_id', 'full_name', 'pb_student_code']),
            'internshipPeriod' => $student->internship ? [
                'start_date' => $student->internship->start_date->toDateString(),
                'end_date' => $student->internship->end_date->toDateString(),
            ] : null,
            'weeklySubmissions' => LogbookWeeklySubmission::where('student_id', $student->student_id)
                ->orderBy('week_start')->orderBy('id')
                ->get(['id', 'week_start', 'week_end', 'status', 'date_change_review_required', 'submitted_at', 'reviewed_at']),
            'missingWeeks' => app(LogbookTracking::class)->missingWeeks($student),
            'today' => BruneiDate::today(),
            'attendance' => app(AttendanceService::class)->summary($student),
            'allowFutureDates' => LogbookTesting::allowsFutureDates(),
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
            'allowFutureDates' => LogbookTesting::allowsFutureDates(),
        ]);
    }

    public function markReviewed(Request $request, LogbookWeeklySubmission $submission)
    {
        abort_unless(in_array($request->user()->role, ['Admin', 'Industry Supervisor'], true), 403,
            'PB Supervisors have view-only access. Industry Supervisors review logbooks; Admin can make corrections.');
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
            $reopenedCorrection = $week->reopened_at && !$week->reopen_resolved_at;
            if ($reopenedCorrection && !in_array($week->status, ['submitted', 'pending'], true)) {
                throw ValidationException::withMessages(['status' => 'The student must correct and resubmit this reopened week before it can be reviewed.']);
            }
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
                    if ($dates && !LogbookTesting::allowsFutureDates() && BruneiDate::isAfterToday(end($dates))) {
                        throw ValidationException::withMessages(['status' => 'This week includes future internship days. Approve after all internship days in this week have occurred.']);
                    }
                    if (!$dates || $entries->count() !== count($dates) || $entries->contains(fn ($entry) =>
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
            if ($reopenedCorrection && $data['status'] === 'approved') {
                $review['reopen_resolved_at'] = now();
            }
            $week->forceFill($review)->save();
            if ($reopenedCorrection) {
                AdminRecordChange::recordWorkflow($request->user(), $week,
                    $data['status'] === 'approved' ? 'Approved corrected logbook week' : 'Requested further logbook corrections', $before);
            } else {
                AdminRecordChange::record($request->user(), $week, 'Reviewed weekly logbook', $before);
            }
        });

        return redirect($request->user()->role === 'Admin'
            ? route('admin.students.show', $submission->student_id)
            : route('industry-supervisor.logbook.student', ['student' => $submission->student_id]))->with('success', 'Logbook review saved.');
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
