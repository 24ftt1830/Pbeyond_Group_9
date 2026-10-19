<?php

use App\Http\Controllers\FinalInternshipReportController;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

uses(Tests\TestCase::class);

beforeEach(function () {
    config([
        'database.default' => 'report_submission_tests',
        'database.connections.report_submission_tests' => [
            'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ]);

    Schema::create('students', function (Blueprint $table) {
        $table->id('student_id');
        $table->unsignedBigInteger('user_id');
        $table->string('full_name');
        $table->timestamps();
    });
    Schema::create('final_internship_reports', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->string('title')->nullable();
        $table->text('body')->nullable();
        $table->dateTime('submitted_at')->nullable();
        $table->string('pdf_path')->nullable();
        $table->string('academic_review_status')->nullable();
        $table->decimal('report_score', 8, 2)->nullable();
        $table->decimal('report_component_weight_snapshot', 8, 2)->nullable();
        $table->unsignedBigInteger('report_template_id')->nullable();
        $table->unsignedInteger('report_template_version')->nullable();
        $table->json('report_template_snapshot')->nullable();
        $table->json('report_answers')->nullable();
        $table->text('academic_review_comments')->nullable();
        $table->dateTime('academic_reviewed_at')->nullable();
        $table->dateTime('reopened_at')->nullable();
        $table->unsignedBigInteger('reopened_by_user_id')->nullable();
        $table->string('industry_confirmation_status')->nullable();
        $table->text('industry_confirmation_comments')->nullable();
        $table->dateTime('industry_confirmed_at')->nullable();
        $table->timestamps();
    });
    Schema::create('internship_completions', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->string('academic_completion_status')->nullable();
        $table->unsignedBigInteger('academic_supervisor_id')->nullable();
        $table->unsignedBigInteger('academic_decided_by_user_id')->nullable();
        $table->dateTime('academic_completion_decided_at')->nullable();
        $table->timestamps();
    });

    DB::table('students')->insert([
        'student_id' => 1,
        'user_id' => 10,
        'full_name' => 'Test Student',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    Auth::guard()->setUser((new User())->forceFill(['user_id' => 10]));
});

function submitStudentReportForTest(): void
{
    $request = Request::create('/final-report', 'POST', [
        'title' => 'Final Internship Report',
        'submit' => '1',
    ]);

    app(FinalInternshipReportController::class)->saveStudent($request);
}

function seedReportForSubmissionTest(array $overrides = []): void
{
    DB::table('final_internship_reports')->insert(array_merge([
        'student_id' => 1,
        'title' => 'Final Internship Report',
        'body' => '',
        'submitted_at' => now()->subDay(),
        'pdf_path' => 'final-internship-reports/original.pdf',
        'academic_review_status' => 'Approved',
        'report_score' => 80,
        'report_component_weight_snapshot' => 20,
        'report_template_id' => 2,
        'report_template_version' => 1,
        'report_template_snapshot' => json_encode(['name' => 'Original rubric']),
        'report_answers' => json_encode(['1' => ['level_id' => 3]]),
        'academic_review_comments' => 'Approved',
        'academic_reviewed_at' => now()->subHours(12),
        'industry_confirmation_status' => 'Confirmed',
        'created_at' => now()->subDay(),
        'updated_at' => now()->subHours(12),
    ], $overrides));
    DB::table('internship_completions')->insert([
        'student_id' => 1,
        'academic_completion_status' => 'Completed',
        'academic_supervisor_id' => 4,
        'academic_decided_by_user_id' => 5,
        'academic_completion_decided_at' => now()->subHours(6),
        'created_at' => now()->subDay(),
        'updated_at' => now()->subHours(6),
    ]);
}

it('blocks a student from changing an approved report until it is reopened', function () {
    seedReportForSubmissionTest();

    try {
        submitStudentReportForTest();
        $this->fail('An approved report should be locked.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('submit');
    }

    $report = DB::table('final_internship_reports')->first();
    $completion = DB::table('internship_completions')->first();
    expect($report->academic_review_status)->toBe('Approved')
        ->and((float) $report->report_score)->toBe(80.0)
        ->and($report->academic_review_comments)->toBe('Approved')
        ->and($completion->academic_completion_status)->toBe('Completed');
});

it('allows a student to resubmit a report when changes were requested', function () {
    seedReportForSubmissionTest([
        'academic_review_status' => 'Changes Required',
        'report_score' => null,
        'report_component_weight_snapshot' => null,
        'academic_review_comments' => 'Please correct the conclusion.',
        'academic_reviewed_at' => now()->subHours(12),
    ]);

    submitStudentReportForTest();

    $report = DB::table('final_internship_reports')->first();
    $completion = DB::table('internship_completions')->first();
    expect($report->academic_review_status)->toBe('Pending Review')
        ->and($report->academic_review_comments)->toBeNull()
        ->and($report->academic_reviewed_at)->toBeNull()
        ->and($completion->academic_completion_status)->toBe('Pending Evaluation');
});

it('allows a student to resubmit an approved report after Superadmin reopens it', function () {
    seedReportForSubmissionTest([
        'reopened_at' => now()->subHour(),
        'reopened_by_user_id' => 9,
    ]);

    submitStudentReportForTest();

    $report = DB::table('final_internship_reports')->first();
    expect($report->academic_review_status)->toBe('Pending Review')
        ->and($report->report_score)->toBeNull()
        ->and($report->reopened_at)->toBeNull();
});
