<?php

use App\Models\AcademicSemester;
use App\Models\Application;
use App\Models\Student;
use App\Models\User;
use App\Services\InternshipWorkflow;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

uses(Tests\TestCase::class);

beforeEach(function () {
    // Keep these service checks isolated from the application's database and
    // from legacy migrations containing MySQL-specific ALTER TABLE statements.
    config([
        'database.default' => 'internship_dates_tests',
        'database.connections.internship_dates_tests' => [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ]);

    Schema::create('academic_semesters', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->date('starts_on');
        $table->date('ends_on');
        $table->timestamps();
    });
    Schema::create('students', function (Blueprint $table) {
        $table->id('student_id');
        $table->string('full_name');
        $table->unsignedBigInteger('intake_semester_id')->nullable();
        $table->timestamps();
    });
    Schema::create('applications', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->string('app_status');
        $table->timestamps();
    });
    Schema::create('internships', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id')->unique();
        $table->date('start_date');
        $table->date('end_date');
        $table->timestamps();
    });
    Schema::create('admin_record_changes', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('subject_type');
        $table->unsignedBigInteger('subject_id');
        $table->string('action');
        $table->text('before_snapshot')->nullable();
        $table->text('after_snapshot')->nullable();
        $table->timestamps();
    });

    foreach ([
        ['January 2026', '2026-01-01', '2026-06-30'],
        ['July 2026', '2026-07-01', '2026-12-31'],
        ['January 2027', '2027-01-01', '2027-06-30'],
        ['July 2027', '2027-07-01', '2027-12-31'],
        ['January 2028', '2028-01-12', '2028-06-15'],
    ] as [$name, $startsOn, $endsOn]) {
        AcademicSemester::create(['name' => $name, 'starts_on' => $startsOn, 'ends_on' => $endsOn]);
    }

    $this->student = Student::create([
        'full_name' => 'Test Student',
        'intake_semester_id' => AcademicSemester::where('name', 'January 2026')->value('id'),
    ]);
    $this->application = Application::create([
        'student_id' => $this->student->student_id,
        'app_status' => 'Recruited',
    ]);
    $this->hr = (new User)->forceFill(['user_id' => 1, 'role' => 'Company']);
    $this->admin = (new User)->forceFill(['user_id' => 2, 'role' => 'Admin']);
});

afterEach(function () {
    $this->travelBack();
    DB::purge('internship_dates_tests');
});

test('HR can schedule a future internship on the exact configured semester boundaries', function () {
    $this->travelTo(Carbon::parse('2026-10-14'));

    app(InternshipWorkflow::class)->dates($this->student, [
        'start_date' => '2028-01-12',
        'end_date' => '2028-06-15',
    ], $this->hr);

    $saved = $this->student->internship()->firstOrFail();
    expect($saved->start_date->toDateString())->toBe('2028-01-12')
        ->and($saved->end_date->toDateString())->toBe('2028-06-15');
});

test('HR cannot replace saved dates with dates outside the student fifth semester', function (string $startsOn, string $endsOn, string $errorField) {
    $this->student->internship()->create(['start_date' => '2028-02-01', 'end_date' => '2028-05-31']);

    try {
        app(InternshipWorkflow::class)->dates($this->student, [
            'start_date' => $startsOn,
            'end_date' => $endsOn,
        ], $this->hr);
        $this->fail('Expected out-of-semester dates to be rejected.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey($errorField);
    }

    $this->assertDatabaseCount('internships', 1);
    $saved = $this->student->internship()->firstOrFail();
    expect($saved->start_date->toDateString())->toBe('2028-02-01')
        ->and($saved->end_date->toDateString())->toBe('2028-05-31');
})->with([
    'during study semester' => ['2027-09-01', '2028-02-01', 'start_date'],
    'before the custom semester start' => ['2028-01-11', '2028-05-31', 'start_date'],
    'after the custom semester end' => ['2028-02-01', '2028-06-16', 'end_date'],
    'entirely after semester five' => ['2028-07-01', '2028-08-31', 'start_date'],
]);

test('HR can correct historical dates within the assigned semester', function () {
    $this->travelTo(Carbon::parse('2029-01-01'));

    app(InternshipWorkflow::class)->dates($this->student, [
        'start_date' => '2028-02-01',
        'end_date' => '2028-05-31',
    ], $this->hr);

    $saved = $this->student->internship()->firstOrFail();
    expect($saved->start_date->toDateString())->toBe('2028-02-01')
        ->and($saved->end_date->toDateString())->toBe('2028-05-31');
});

test('HR cannot assign dates when an intake or its fifth term is missing', function (bool $missingIntake) {
    $this->student->update([
        'intake_semester_id' => $missingIntake ? null : AcademicSemester::where('name', 'January 2028')->value('id'),
    ]);

    try {
        app(InternshipWorkflow::class)->dates($this->student, ['start_date' => '2028-02-01', 'end_date' => '2028-05-31'], $this->hr);
        $this->fail('Expected dates without a semester 5 period to be rejected.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('start_date');
    }

    $this->assertDatabaseCount('internships', 0);
})->with(['missing intake' => true, 'missing fifth term' => false]);

test('Admin can record a historical exception outside the expected semester and it is audited', function () {
    app(InternshipWorkflow::class)->dates($this->student, [
        'start_date' => '2025-08-01',
        'end_date' => '2025-11-30',
    ], $this->admin);

    $saved = $this->student->internship()->firstOrFail();
    expect($saved->start_date->toDateString())->toBe('2025-08-01')
        ->and($saved->end_date->toDateString())->toBe('2025-11-30');
    $this->assertDatabaseHas('admin_record_changes', [
        'user_id' => $this->admin->user_id,
        'action' => 'Updated internship dates',
    ]);
});

test('recruitment is required even for an Admin date exception', function () {
    $this->application->update(['app_status' => 'Pending']);

    try {
        app(InternshipWorkflow::class)->dates($this->student, ['start_date' => '2025-08-01', 'end_date' => '2025-11-30'], $this->admin);
        $this->fail('Expected an unrecruited student to be rejected.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('start_date');
    }

    $this->assertDatabaseCount('internships', 0);
});
