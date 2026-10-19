<?php

use App\Models\EvaluationSubmission;
use App\Models\IndustrySupervisor;
use App\Models\Student;
use App\Services\InternshipCompletionStatus;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(Tests\TestCase::class);

beforeEach(function () {
    // Exercise relationship queries without running legacy MySQL migrations
    // or connecting to the application's database.
    config([
        'database.default' => 'supervisor_relationship_tests',
        'database.connections.supervisor_relationship_tests' => [
            'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ]);

    Schema::create('students', function (Blueprint $table) {
        $table->id('student_id');
        $table->string('full_name');
    });
    Schema::create('industry_supervisors', function (Blueprint $table) {
        $table->id('supervisor_id');
        $table->unsignedBigInteger('company_id');
    });
    Schema::create('placement_quotas', function (Blueprint $table) {
        $table->id('quota_id');
        $table->unsignedBigInteger('company_id');
    });
    Schema::create('applications', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->unsignedBigInteger('quota_id');
        $table->string('app_status');
    });
    Schema::create('supervisor_assignments', function (Blueprint $table) {
        $table->id('assignment_id');
        $table->unsignedBigInteger('supervisor_id');
        $table->unsignedBigInteger('student_id');
    });
    Schema::create('academic_supervisor_assignments', function (Blueprint $table) {
        $table->id('assignment_id');
        $table->unsignedBigInteger('student_id');
        $table->unsignedBigInteger('academic_supervisor_id');
    });
    Schema::create('evaluation_templates', function (Blueprint $table) {
        $table->id();
        $table->string('supervisor_type');
        $table->boolean('is_active');
        $table->decimal('component_weight');
    });
    Schema::create('evaluation_submissions', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->string('supervisor_type');
        $table->unsignedBigInteger('academic_supervisor_id')->nullable();
        $table->unsignedBigInteger('industry_supervisor_id')->nullable();
        $table->json('template_snapshot');
        $table->decimal('overall_score');
        $table->timestamp('submitted_at');
        $table->timestamp('reopened_at')->nullable();
    });
    Schema::create('final_internship_reports', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->timestamp('submitted_at');
        $table->string('pdf_path');
        $table->string('academic_review_status');
        $table->timestamp('reopened_at')->nullable();
        $table->decimal('report_score');
        $table->decimal('report_component_weight_snapshot');
    });
    Schema::create('internship_completions', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->string('industry_confirmation_status');
        $table->string('academic_completion_status');
    });

    foreach (range(1, 6) as $id) {
        DB::table('students')->insert(['student_id' => $id, 'full_name' => "Student $id"]);
    }
    foreach ([1 => 1, 2 => 1, 3 => 2, 4 => 1] as $supervisor => $company) {
        DB::table('industry_supervisors')->insert(['supervisor_id' => $supervisor, 'company_id' => $company]);
    }
    DB::table('placement_quotas')->insert([
        ['quota_id' => 1, 'company_id' => 1], ['quota_id' => 2, 'company_id' => 2],
    ]);
    foreach ([
        [1, 1, 1, 'Recruited'], [2, 2, 2, 'Recruited'],
        [3, 3, 1, 'Pending'], [4, 4, 1, 'Recruited'],
        [5, 5, 1, 'Recruited'], [6, 6, 2, 'Recruited'],
        [7, 1, 2, 'Declined'],
    ] as [$id, $student, $quota, $status]) {
        DB::table('applications')->insert(['id' => $id, 'student_id' => $student, 'quota_id' => $quota, 'app_status' => $status]);
    }
    foreach ([[1, 1], [1, 2], [1, 3], [2, 5], [3, 6]] as [$supervisor, $student]) {
        // Student 2 deliberately has an invalid cross-company legacy assignment.
        DB::table('supervisor_assignments')->insert(['supervisor_id' => $supervisor, 'student_id' => $student]);
    }
    DB::table('academic_supervisor_assignments')->insert(['student_id' => 1, 'academic_supervisor_id' => 1]);
    foreach (['Academic Supervisor', 'Industry Supervisor'] as $type) {
        DB::table('evaluation_templates')->insert(['supervisor_type' => $type, 'is_active' => true, 'component_weight' => 40]);
    }
    foreach ([[1, 'Academic Supervisor', 1, null, 32], [2, 'Industry Supervisor', null, 1, 36]] as [$id, $type, $academic, $industry, $score]) {
        DB::table('evaluation_submissions')->insert([
            'id' => $id, 'student_id' => 1, 'supervisor_type' => $type,
            'academic_supervisor_id' => $academic, 'industry_supervisor_id' => $industry,
            'template_snapshot' => json_encode(['component_weight' => 40, 'sections' => [['weight' => 40]]]),
            'overall_score' => $score, 'submitted_at' => '2026-10-18 12:00:00',
        ]);
    }
    DB::table('final_internship_reports')->insert([
        'student_id' => 1, 'submitted_at' => '2026-10-18 12:00:00', 'pdf_path' => 'test-report.pdf',
        'academic_review_status' => 'Approved', 'report_score' => 80, 'report_component_weight_snapshot' => 20,
    ]);
    DB::table('internship_completions')->insert([
        'student_id' => 1, 'industry_confirmation_status' => 'Confirmed', 'academic_completion_status' => 'Completed',
    ]);
});

afterEach(function () {
    DB::purge('supervisor_relationship_tests');
});

test('direct student access includes only assigned students recruited by the supervisor company', function () {
    expect(IndustrySupervisor::findOrFail(1)->students()->pluck('students.student_id')->all())->toBe([1]);
});

test('student existence queries retain the company and recruitment restrictions', function () {
    expect(IndustrySupervisor::whereHas('students', fn ($query) => $query->where('students.student_id', 1))->pluck('supervisor_id')->all())->toBe([1])
        ->and(IndustrySupervisor::whereHas('students', fn ($query) => $query->where('students.student_id', 2))->exists())->toBeFalse()
        ->and(IndustrySupervisor::whereDoesntHave('students')->pluck('supervisor_id')->all())->toBe([4]);
});

test('eager loading and student counts keep each supervisor students separate', function () {
    $supervisors = IndustrySupervisor::with(['students', 'applications'])
        ->withCount(['students', 'applications'])->orderBy('supervisor_id')->get();

    expect($supervisors->map(fn ($supervisor) => $supervisor->students->pluck('student_id')->all())->all())->toBe([[1], [5], [6], []])
        ->and($supervisors->pluck('students_count')->all())->toBe([1, 1, 1, 0])
        ->and($supervisors->map(fn ($supervisor) => $supervisor->applications->pluck('id')->all())->all())->toBe([[1], [5], [6], []])
        ->and($supervisors->pluck('applications_count')->all())->toBe([1, 1, 1, 0]);
});

test('direct application access excludes unassigned pending and cross-company applications', function () {
    expect(IndustrySupervisor::findOrFail(1)->applications()->pluck('applications.id')->all())->toBe([1]);
});

test('company setup checks direct supervisor assignments for that company', function () {
    $studentsForCompany = fn (int $companyId) => Student::whereHas('applications', fn ($query) => $query
        ->where('app_status', 'Recruited')
        ->whereHas('quota', fn ($quota) => $quota->where('company_id', $companyId)))
        ->with(['supervisorAssignments' => fn ($query) => $query->whereHas(
            'supervisor', fn ($supervisor) => $supervisor->where('company_id', $companyId)
        )])
        ->orderBy('student_id')->get();

    $companyOne = $studentsForCompany(1)->mapWithKeys(fn ($student) => [
        $student->student_id => $student->supervisorAssignments->isEmpty(),
    ])->all();
    $companyTwo = $studentsForCompany(2)->mapWithKeys(fn ($student) => [
        $student->student_id => $student->supervisorAssignments->isEmpty(),
    ])->all();

    expect($companyOne)->toBe([1 => false, 4 => true, 5 => false])
        ->and($companyTwo)->toBe([2 => true, 6 => false]);
});

test('application existence queries retain their company restrictions', function () {
    expect(IndustrySupervisor::whereHas('applications', fn ($query) => $query->where('applications.student_id', 1))->pluck('supervisor_id')->all())->toBe([1])
        ->and(IndustrySupervisor::whereHas('applications', fn ($query) => $query->where('applications.student_id', 2))->exists())->toBeFalse();
});

test('PB student details can use the assigned supervisor lookup as an evaluation subquery', function () {
    $supervisors = IndustrySupervisor::whereHas('students', fn ($query) => $query->where('students.student_id', 1))->select('supervisor_id');
    $evaluations = EvaluationSubmission::where('student_id', 1)->where('supervisor_type', 'Industry Supervisor')
        ->whereIn('industry_supervisor_id', $supervisors)->pluck('id')->all();

    expect($evaluations)->toBe([2]);
});

test('completion and combined scores can resolve both assigned supervisors', function () {
    $student = Student::findOrFail(1);
    $service = app(InternshipCompletionStatus::class);

    expect($service->overallScore($student))->toBe(84.0)
        ->and($service->canAcademicFinalize($student, 'Completed'))->toBeTrue()
        ->and($service->for($student))->toBe('Completed');
});
