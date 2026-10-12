<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internship_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('students', 'student_id')->cascadeOnDelete();

            $table->enum('industry_confirmation_status', ['Pending Confirmation', 'Confirmed', 'Changes Required'])
                ->default('Pending Confirmation');
            $table->text('industry_confirmation_comments')->nullable();
            $table->foreignId('industry_supervisor_id')->nullable()
                ->constrained('industry_supervisors', 'supervisor_id')->nullOnDelete();
            $table->timestamp('industry_reviewed_at')->nullable();
            $table->timestamp('industry_confirmed_at')->nullable();

            $table->enum('academic_completion_status', ['Pending Evaluation', 'Completed', 'Incomplete'])
                ->default('Pending Evaluation');
            $table->text('academic_completion_comments')->nullable();
            $table->foreignId('academic_supervisor_id')->nullable()
                ->constrained('academic_supervisors', 'academic_supervisor_id')->nullOnDelete();
            $table->timestamp('academic_completion_decided_at')->nullable();

            $table->timestamps();
        });

        DB::table('final_internship_reports')
            ->select([
                'student_id',
                'industry_confirmation_status',
                'industry_confirmation_comments',
                'industry_confirmed_at',
                'created_at',
                'updated_at',
            ])
            ->orderBy('student_id')
            ->chunk(100, function ($reports) {
                $now = now();
                DB::table('internship_completions')->insertOrIgnore(
                    $reports->map(fn ($report) => [
                        'student_id' => $report->student_id,
                        'industry_confirmation_status' => $report->industry_confirmation_status ?? 'Pending Confirmation',
                        'industry_confirmation_comments' => $report->industry_confirmation_comments,
                        'industry_confirmed_at' => $report->industry_confirmed_at,
                        'industry_reviewed_at' => $report->industry_confirmed_at,
                        'created_at' => $report->created_at ?? $now,
                        'updated_at' => $report->updated_at ?? $now,
                    ])->all()
                );
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('internship_completions');
    }
};
