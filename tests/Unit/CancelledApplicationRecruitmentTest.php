<?php

use App\Models\Application;
use App\Models\User;
use App\Services\InternshipWorkflow;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

uses(Tests\TestCase::class);

beforeEach(function () {
    config([
        'database.default' => 'cancelled_application_tests',
        'database.connections.cancelled_application_tests' => [
            'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ]);

    Schema::create('students', function (Blueprint $table) {
        $table->id('student_id');
        $table->unsignedBigInteger('user_id')->nullable();
        $table->string('full_name');
        $table->timestamps();
    });
    Schema::create('placement_quotas', function (Blueprint $table) {
        $table->id('quota_id');
        $table->unsignedBigInteger('company_id');
        $table->unsignedInteger('total_slots');
        $table->timestamps();
    });
    Schema::create('applications', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('student_id');
        $table->unsignedBigInteger('quota_id');
        $table->string('app_status');
        $table->dateTime('interview_date')->nullable();
        $table->timestamps();
    });

    DB::table('students')->insert([
        'student_id' => 1, 'user_id' => 10, 'full_name' => 'Test Student',
        'created_at' => now(), 'updated_at' => now(),
    ]);
    DB::table('placement_quotas')->insert([
        'quota_id' => 1, 'company_id' => 20, 'total_slots' => 1,
        'created_at' => now(), 'updated_at' => now(),
    ]);
    DB::table('applications')->insert([
        'id' => 1, 'student_id' => 1, 'quota_id' => 1, 'app_status' => 'Cancelled',
        'created_at' => now(), 'updated_at' => now(),
    ]);
});

it('prevents Company HR from recruiting an application cancelled by the student', function () {
    $application = Application::findOrFail(1);
    $companyHr = (new User())->forceFill(['user_id' => 30, 'role' => 'Company']);

    try {
        app(InternshipWorkflow::class)->application($application, [
            'status' => 'Recruited',
            'interview_date' => null,
        ], $companyHr);
        $this->fail('Company HR should not be able to reopen a cancelled application.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('status');
    }

    expect(DB::table('applications')->where('id', 1)->value('app_status'))->toBe('Cancelled');
});
