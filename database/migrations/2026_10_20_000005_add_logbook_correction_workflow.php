<?php

use App\Models\InternshipCompletion;
use App\Models\LogbookWeeklySubmission;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->timestamp('reopened_at')->nullable();
            $table->foreignId('reopened_by_user_id')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->text('reopen_reason')->nullable();
            $table->timestamp('reopen_resolved_at')->nullable();
            $table->index(['student_id', 'reopened_at', 'reopen_resolved_at'], 'logbook_open_corrections_index');
        });

        // Bring earlier Superadmin reopenings into the same workflow without removing saved records.
        $pendingStudents = [];
        $reopenings = DB::table('admin_record_changes')
            ->where('subject_type', (new LogbookWeeklySubmission)->getMorphClass())
            ->where('action', 'Reopened logbook for student correction')
            ->orderByDesc('id')->get()->unique('subject_id');

        foreach ($reopenings as $change) {
            $week = DB::table('logbook_weekly_submissions')->where('id', $change->subject_id)->first();
            if (!$week) continue;
            $resolved = in_array($week->status, ['approved', 'reviewed'], true);
            DB::table('logbook_weekly_submissions')->where('id', $week->id)->update([
                'reopened_at' => $change->created_at,
                'reopened_by_user_id' => $change->user_id,
                'reopen_reason' => 'Legacy reopening: no reason was recorded.',
                'reopen_resolved_at' => $resolved ? ($week->reviewed_at ?? $week->updated_at ?? $change->created_at) : null,
            ]);
            if (!$resolved) $pendingStudents[] = $week->student_id;
        }

        foreach (array_unique($pendingStudents) as $studentId) {
            DB::transaction(function () use ($studentId) {
                DB::table('students')->where('student_id', $studentId)->lockForUpdate()->first();
                $completion = DB::table('internship_completions')->where('student_id', $studentId)
                    ->whereIn('academic_completion_status', ['Completed', 'Incomplete'])->lockForUpdate()->first();
                if (!$completion) return;
                $before = (array) $completion;
                DB::table('internship_completions')->where('id', $completion->id)->update([
                    'academic_completion_status' => 'Pending Evaluation',
                    'academic_supervisor_id' => null,
                    'academic_decided_by_user_id' => null,
                    'academic_completion_decided_at' => null,
                    'updated_at' => now(),
                ]);
                $after = (array) DB::table('internship_completions')->where('id', $completion->id)->first();
                $after['_workflow'] = ['reason' => 'An existing reopened logbook still requires correction and approval.'];
                DB::table('admin_record_changes')->insert([
                    'user_id' => null,
                    'subject_type' => (new InternshipCompletion)->getMorphClass(),
                    'subject_id' => $completion->id,
                    'action' => 'Final completion reopened for logbook correction',
                    'before_snapshot' => json_encode($before, JSON_THROW_ON_ERROR),
                    'after_snapshot' => json_encode($after, JSON_THROW_ON_ERROR),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
        }
    }

    public function down(): void
    {
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->dropIndex('logbook_open_corrections_index');
            $table->dropConstrainedForeignId('reopened_by_user_id');
            $table->dropColumn(['reopened_at', 'reopen_reason', 'reopen_resolved_at']);
        });
    }
};
