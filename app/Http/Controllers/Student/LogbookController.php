<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\IndustrySupervisor;
use App\Models\LogbookEntry;
use App\Models\LogbookReminder;
use App\Models\LogbookWeeklySubmission;
use App\Models\Student;
use App\Services\AttendanceService;
use App\Services\LogbookTracking;
use App\Support\BruneiDate;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;
        abort_unless($student, 404);
        $internship = $student->internship;
        $entries = LogbookEntry::where('student_id', $student->student_id)->get()
            ->mapWithKeys(fn ($entry) => [$entry->date->toDateString() => $this->entryData($entry)]);
        $submissions = LogbookWeeklySubmission::where('student_id', $student->student_id)->get()
            ->mapWithKeys(fn ($week) => [$week->week_start->toDateString() => $week->toArray()]);
        $logbookTracking = app(LogbookTracking::class);

        return Inertia::render('Student/Logbook', [
            'entries' => $entries, 'weeklySubmissions' => $submissions,
            'missingLogbookWeeks' => $logbookTracking->missingWeeks($student),
            'unlockedWeekStart' => $logbookTracking->firstUnapprovedWeekStart($student),
            'isRecruited' => $student->applications()->where('app_status', 'Recruited')->exists(),
            'internshipPeriod' => $internship ? [
                'start_date' => $internship->start_date->toDateString(),
                'end_date' => $internship->end_date->toDateString(),
            ] : null,
            'today' => BruneiDate::today(),
            'attendance' => app(AttendanceService::class)->summary($student),
            'canExport' => $internship && BruneiDate::isPast($internship->end_date),
        ]);
    }

    public function create(Request $request)
    {
        return $this->dayPage($request, 'Student/LogbookSubmission');
    }

    public function attachmentsPage(Request $request)
    {
        return $this->dayPage($request, 'Student/LogbookAttachments');
    }

    private function dayPage(Request $request, string $page)
    {
        $student = $request->user()->student;
        abort_unless($student, 404);
        $date = $request->validate(['date' => ['required', 'date_format:Y-m-d']])['date'];
        $this->ensureEditable($student, $date);
        $entry = LogbookEntry::where('student_id', $student->student_id)->whereDate('date', $date)->first();

        return Inertia::render($page, [
            'date' => $date, 'entry' => $entry ? $this->entryData($entry) : null,
            'weekSubmission' => $this->weekForDate($student, $date),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'status' => ['required', 'in:working,permission,absent,holiday,none'],
            'description' => ['nullable', 'string', 'required_if:status,working'],
            'learning_outcomes' => ['nullable', 'string', 'required_if:status,working'],
            'issues' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,csv,txt'],
            'remove_attachment_ids' => ['nullable', 'array', 'max:5'],
            'remove_attachment_ids.*' => ['string'],
        ]);
        $student = $request->user()->student;
        abort_unless($student, 404);
        $storedPaths = [];
        $deletedPaths = [];
        try {
            DB::transaction(function () use ($request, $student, $data, &$storedPaths, &$deletedPaths) {
                $student = Student::whereKey($student->student_id)->lockForUpdate()->firstOrFail();
                $this->ensureEditable($student, $data['date']);
                $entry = LogbookEntry::where('student_id', $student->student_id)->whereDate('date', $data['date'])->first();
                $previousAttachments = $entry?->attachments ?? [];
                if ($data['status'] === 'none') {
                    $deletedPaths = array_column($previousAttachments, 'path');
                    $entry?->delete();
                    return;
                }
                $removeIds = $data['remove_attachment_ids'] ?? [];
                $attachments = array_values(array_filter($previousAttachments, function ($file) use ($removeIds, &$deletedPaths) {
                    if (in_array($file['id'], $removeIds, true)) {
                        $deletedPaths[] = $file['path'];
                        return false;
                    }
                    return true;
                }));
                $uploads = $request->file('attachments', []);
                if (count($attachments) + count($uploads) > 5) {
                    throw ValidationException::withMessages(['attachments' => 'Keep a maximum of 5 attachments per day.']);
                }
                if ($data['status'] === 'permission' && !$attachments && !$uploads && !$entry?->legacy_permission) {
                    throw ValidationException::withMessages(['attachments' => 'Upload permission or MC evidence for this day.']);
                }
                foreach ($uploads as $file) {
                    $path = $file->store('logbook/'.$student->student_id, 'local');
                    if (!$path) {
                        throw new \RuntimeException('The attachment could not be saved. Please try again.');
                    }
                    $storedPaths[] = $path;
                    $attachments[] = [
                        'id' => (string) Str::uuid(), 'path' => $path,
                        'name' => $file->getClientOriginalName(), 'mime' => $file->getMimeType(), 'size' => $file->getSize(),
                    ];
                }
                LogbookEntry::updateOrCreate(['student_id' => $student->student_id, 'date' => $data['date']], [
                    'status' => $data['status'], 'description' => $data['description'] ?? null,
                    'learning_outcomes' => $data['learning_outcomes'] ?? null, 'issues' => $data['issues'] ?? null,
                    'attachments' => $attachments,
                    'legacy_permission' => $data['status'] === 'permission' && (bool) $entry?->legacy_permission,
                ]);
            });
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($storedPaths);
            throw $exception;
        }
        Storage::disk('local')->delete($deletedPaths);

        return redirect()->route('student.logbook', ['week' => $data['date']])
            ->with('success', $data['status'] === 'none' ? 'Daily log cleared.' : 'Daily log saved.');
    }

    public function submitWeek(Request $request)
    {
        $date = $request->validate(['week_start' => ['required', 'date_format:Y-m-d']])['week_start'];
        $student = $request->user()->student;
        abort_unless($student, 404);
        DB::transaction(function () use ($student, $date) {
            $student = Student::whereKey($student->student_id)->lockForUpdate()->firstOrFail();
            if (!$student->applications()->where('app_status', 'Recruited')->exists() || !$student->internship) {
                throw ValidationException::withMessages(['week' => 'Recruitment and internship dates are required.']);
            }
            $start = Carbon::parse($date)->startOfWeek();
            $end = $start->copy()->endOfWeek()->startOfDay();
            $activeStart = $start->copy()->max($student->internship->start_date);
            $activeEnd = $end->copy()->min($student->internship->end_date);
            if ($activeStart->gt($activeEnd)) {
                throw ValidationException::withMessages(['week' => 'Submit only a completed week within your internship dates.']);
            }
            if (!app(LogbookTracking::class)->previousWeeksApproved($student, $start)) {
                throw ValidationException::withMessages(['week' => 'Submit and get approval for every earlier internship week before submitting this week.']);
            }
            $expected = app(AttendanceService::class)->periodDates($activeStart, $activeEnd);
            if (!$expected || BruneiDate::isAfterToday(end($expected))) {
                throw ValidationException::withMessages(['week' => 'Submit after all internship days in this week have occurred.']);
            }
            $this->ensureComplete($student, $expected);
            $submission = LogbookWeeklySubmission::where('student_id', $student->student_id)
                ->whereDate('week_start', Carbon::parse($date)->startOfWeek()->toDateString())->first();
            if ($submission && !in_array($submission->status, ['pending_fix', 'revision', 'needs_revision'], true)) {
                throw ValidationException::withMessages(['week' => 'This week has already been submitted.']);
            }
            LogbookWeeklySubmission::updateOrCreate([
                'student_id' => $student->student_id, 'week_start' => Carbon::parse($date)->startOfWeek()->toDateString(),
            ], ['week_end' => Carbon::parse($date)->endOfWeek()->toDateString(), 'status' => 'submitted', 'submitted_at' => now()]);
            LogbookReminder::where('student_id', $student->student_id)
                ->whereDate('week_start', Carbon::parse($date)->startOfWeek())->delete();
        });

        return back()->with('success', 'Weekly logbook submitted to your Industry Supervisor.');
    }

    public function destroy(Request $request, string $date)
    {
        $request->merge(['date' => $date, 'status' => 'none']);
        return $this->store($request);
    }

    public function downloadAttachment(Request $request, LogbookEntry $entry, string $attachment)
    {
        $user = $request->user();
        $allowed = $user->role === 'Admin' || ($user->role === 'Student' && (int) $user->student?->student_id === (int) $entry->student_id);
        if ($user->role === 'Academic Supervisor') {
            $supervisor = AcademicSupervisor::where('user_id', $user->getKey())->first();
            $allowed = $supervisor && $entry->student->academicSupervisorAssignments()
                ->where('academic_supervisor_id', $supervisor->academic_supervisor_id)->exists();
        }
        if ($user->role === 'Industry Supervisor') {
            $supervisor = IndustrySupervisor::where('user_id', $user->getKey())->first();
            $allowed = $supervisor && $supervisor->students()->where('students.student_id', $entry->student_id)->exists();
        }
        abort_unless($allowed, 403);
        $file = collect($entry->attachments ?? [])->firstWhere('id', $attachment);
        abort_unless($file && Storage::disk('local')->exists($file['path']), 404);

        return Storage::disk('local')->download($file['path'], basename($file['name']), ['X-Content-Type-Options' => 'nosniff']);
    }

    public function export(Request $request)
    {
        $student = $request->user()->student;
        abort_unless($student, 404);
        $internship = $student->internship;
        abort_unless($internship && BruneiDate::isPast($internship->end_date), 403, 'Download is available after your internship ends.');
        $entries = LogbookEntry::where('student_id', $student->student_id)->orderBy('date')->get()->keyBy(fn ($entry) => $entry->date->toDateString());
        $weeks = LogbookWeeklySubmission::where('student_id', $student->student_id)->get()->keyBy(fn ($week) => $week->week_start->toDateString());
        $periodDates = app(AttendanceService::class)->periodDates($internship->start_date, $internship->end_date);
        $dates = $entries->keys()->all();
        for ($date = $internship->start_date->copy(); $date->lte($internship->end_date); $date->addDay()) {
            $dates[] = $date->toDateString();
        }
        $dates = array_values(array_unique($dates));
        sort($dates);

        return response()->streamDownload(function () use ($student, $internship, $entries, $weeks, $periodDates, $dates) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Student ID', 'Student', 'Internship start', 'Internship end', 'Date', 'Within internship period', 'Daily status', 'Activities', 'Learning outcomes', 'Issues', 'Attachment names', 'Week start', 'Week end', 'Weekly status', 'Supervisor feedback', 'Flagged entries', 'Submitted at', 'Reviewed at', 'Reviewer role']);
            foreach ($dates as $date) {
                $entry = $entries->get($date);
                $week = $weeks->get(Carbon::parse($date)->startOfWeek()->toDateString());
                $row = [$student->pb_student_code, $student->full_name, $internship->start_date->toDateString(), $internship->end_date->toDateString(), $date,
                    in_array($date, $periodDates, true) ? 'Yes' : 'No', $this->statusLabel($entry?->status), $entry?->description,
                    $entry?->learning_outcomes, $entry?->issues, implode('; ', array_column($entry?->attachments ?? [], 'name')),
                    $week?->week_start?->toDateString(), $week?->week_end?->toDateString(), $week?->status, $week?->supervisor_feedback,
                    implode('; ', $week?->flagged_entries ?? []), $week?->submitted_at?->toDateTimeString(), $week?->reviewed_at?->toDateTimeString(), $week?->reviewer_role === 'Academic Supervisor' ? 'PB Supervisor' : $week?->reviewer_role];
                fputcsv($handle, array_map(fn ($value) => is_string($value) && preg_match('/^[\s]*[=+@-]/u', $value) ? "'".$value : $value, $row));
            }
            fclose($handle);
        }, 'logbook-'.$student->pb_student_code.'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function ensureEditable(Student $student, string $date): void
    {
        if (!$student->applications()->where('app_status', 'Recruited')->exists() || !$student->internship) {
            throw ValidationException::withMessages(['date' => 'Recruitment and internship dates are required before entering a logbook.']);
        }
        $entryDate = Carbon::parse($date)->toDateString();
        if ($entryDate < $student->internship->start_date->toDateString()
            || $entryDate > $student->internship->end_date->toDateString()
            || BruneiDate::isAfterToday($entryDate)) {
            throw ValidationException::withMessages(['date' => 'Choose today or an earlier date within your internship period.']);
        }
        if (!app(LogbookTracking::class)->previousWeeksApproved($student, Carbon::parse($entryDate)->startOfWeek())) {
            throw ValidationException::withMessages(['week' => 'This week is locked until every earlier internship week is approved by your Industry Supervisor.']);
        }
        $week = $this->weekForDate($student, $date);
        if ($week && !in_array($week->status, ['pending_fix', 'revision', 'needs_revision'], true)) {
            throw ValidationException::withMessages(['week' => 'This week is locked after submission. Your Industry Supervisor must request corrections before you can edit it.']);
        }
    }

    private function weekForDate(Student $student, string $date): ?LogbookWeeklySubmission
    {
        return LogbookWeeklySubmission::where('student_id', $student->student_id)
            ->whereDate('week_start', '<=', $date)->whereDate('week_end', '>=', $date)->first();
    }

    private function ensureComplete(Student $student, array $dates): void
    {
        $entries = LogbookEntry::where('student_id', $student->student_id)->whereIn('date', $dates)->get();
        if ($entries->count() !== count($dates) || $entries->contains(fn ($entry) =>
            !in_array($entry->status, ['working', 'permission', 'absent', 'holiday'], true)
            || ($entry->status === 'working' && (blank($entry->description) || blank($entry->learning_outcomes)))
            || ($entry->status === 'permission' && !$entry->legacy_permission && empty($entry->attachments))
        )) {
            throw ValidationException::withMessages(['week' => 'Complete every internship day, including permission/MC evidence, before submitting.']);
        }
    }

    private function entryData(LogbookEntry $entry): array
    {
        return array_merge($entry->toArray(), ['attachments' => collect($entry->attachments ?? [])->map(fn ($file) => [
            'id' => $file['id'], 'name' => $file['name'], 'mime' => $file['mime'], 'size' => $file['size'],
            'url' => route('logbook.attachments.download', [$entry->id, $file['id']]),
        ])->all()]);
    }

    private function statusLabel(?string $status): string
    {
        return match ($status) {
            'working' => 'Work day', 'permission', 'off' => 'Absent with permission/MC',
            'absent' => 'Absent', 'holiday' => 'Public Holiday', default => 'Not logged',
        };
    }
}
