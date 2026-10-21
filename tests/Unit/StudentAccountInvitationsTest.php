<?php

use App\Http\Middleware\ExpireQuotaRequests;
use App\Http\Middleware\HandleInertiaRequests;
use App\Imports\StudentsImport;
use App\Jobs\SendStudentAccountInvitation;
use App\Models\Student;
use App\Models\User;
use App\Notifications\StudentAccountInvitation;
use App\Services\StudentAccountInvitations;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;

uses(Tests\TestCase::class);

beforeEach(function () {
    config([
        'database.default' => 'student_invitation_tests',
        'database.connections.student_invitation_tests' => [
            'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
        ],
    ]);
    $this->withoutMiddleware([HandleInertiaRequests::class, ExpireQuotaRequests::class]);
    Schema::create('users', function (Blueprint $table) {
        $table->id('user_id');
        $table->string('username')->unique();
        $table->string('email')->unique();
        $table->string('password');
        $table->string('role');
        $table->unsignedBigInteger('company_id')->nullable();
        $table->timestamps();
    });
    (require database_path('migrations/2026_10_20_000002_add_password_reset_support.php'))->up();
    (require database_path('migrations/2026_10_20_000003_add_student_account_invitations.php'))->up();
    Schema::create('students', function (Blueprint $table) {
        $table->id('student_id');
        $table->unsignedBigInteger('user_id');
        $table->string('pb_student_code')->unique();
        $table->string('full_name');
        $table->unsignedBigInteger('programme_id');
        $table->unsignedBigInteger('intake_semester_id');
        $table->string('intake_session');
        $table->decimal('cgpa')->default(0);
        $table->timestamps();
    });
    Schema::create('programmes', function (Blueprint $table) {
        $table->id('programme_id');
        $table->string('programme_name');
    });
    Schema::create('academic_semesters', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->date('starts_on');
        $table->date('ends_on');
    });
    Schema::create('admin_record_changes', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('subject_type');
        $table->unsignedBigInteger('subject_id');
        $table->string('action');
        $table->json('before_snapshot')->nullable();
        $table->json('after_snapshot')->nullable();
        $table->timestamps();
    });
    DB::table('programmes')->insert(['programme_id' => 1, 'programme_name' => 'Web Technology']);
    DB::table('academic_semesters')->insert(['id' => 1, 'name' => 'July 2026', 'starts_on' => '2026-07-01', 'ends_on' => '2026-12-31']);
    Notification::fake();
    Queue::fake();
});

function invitationTestUser(string $role = 'Student'): User
{
    $number = User::count() + 1;
    return User::create([
        'username' => 'INVITE'.$number, 'email' => 'invite-'.$number.'@example.test',
        'role' => $role, 'password' => Hash::make('original-password'),
    ]);
}

test('manual student creation does not release access or send credentials', function () {
    $this->actingAs(invitationTestUser('Admin'))->post(route('admin.manage-users.store'), [
        'role' => 'Student', 'username' => 'NEW001', 'full_name' => 'New Student',
        'email' => 'new@example.test', 'programme_id' => 1, 'pb_student_code' => 'NEW001', 'intake_semester_id' => 1,
    ])->assertSessionHasNoErrors();
    $user = User::where('email', 'new@example.test')->firstOrFail();
    expect($user->student_invitation_status)->toBe('not_invited');
    expect($user->student_access_released_at)->toBeNull();
    expect(Hash::check('NEW001', $user->password))->toBeFalse();
    expect($user->student->full_name)->toBe('New Student');
    Notification::assertNothingSent();
    Queue::assertNothingPushed();
});

test('CSV import supports real emails and reimport preserves passwords and access state', function () {
    $import = new StudentsImport(1);
    $row = ['student_code' => 'CSV001', 'full_name' => 'CSV Student', 'email' => 'csv@example.test', 'programme_id' => 1, 'cgpa' => 3.2];
    $import->model($row);
    $user = User::where('email', 'csv@example.test')->firstOrFail();
    expect($user->student_invitation_status)->toBe('not_invited');
    expect(Hash::check('CSV001', $user->password))->toBeFalse();
    $user->forceFill(['student_access_released_at' => now(), 'student_password_set_at' => now(), 'student_invitation_status' => 'active'])->save();
    $password = $user->password;
    $import->model([...$row, 'full_name' => 'Updated Student']);
    expect($user->fresh()->password)->toBe($password);
    expect($user->fresh()->student_invitation_status)->toBe('active');
    expect(Student::count())->toBe(1);
    Notification::assertNothingSent();
    Queue::assertNothingPushed();
});

test('actual CSV uploads create staged students without emailing them', function () {
    $csv = "student_code,full_name,email,programme_id,cgpa\nCSV002,CSV Upload,uploaded@example.test,1,3.0\n";
    $this->actingAs(invitationTestUser('Admin'))->post(route('admin.students.import'), [
        'intake_semester_id' => 1, 'file' => UploadedFile::fake()->createWithContent('students.csv', $csv),
    ])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('users', ['email' => 'uploaded@example.test', 'student_invitation_status' => 'not_invited']);
    Notification::assertNothingSent();
    Queue::assertNothingPushed();
});

test('invalid CSV rows report errors and roll back the whole import', function () {
    $csv = "student_code,full_name,email,programme_id,cgpa\nCSV003,Valid,valid@example.test,1,3.0\nCSV004,Invalid,not-an-email,1,3.0\n";
    $this->actingAs(invitationTestUser('Admin'))->post(route('admin.students.import'), [
        'intake_semester_id' => 1, 'file' => UploadedFile::fake()->createWithContent('students.csv', $csv),
    ])->assertSessionHasErrors('file');
    expect(Student::count())->toBe(0);
    Notification::assertNothingSent();
});

test('importing an existing student with a different email requires an explicit account edit', function () {
    $import = new StudentsImport(1);
    $row = ['student_code' => 'CSV005', 'full_name' => 'Student', 'email' => 'original@example.test', 'programme_id' => 1];
    $import->model($row);
    expect(fn () => $import->model([...$row, 'email' => 'changed@example.test']))->toThrow(\Illuminate\Validation\ValidationException::class);
    expect(User::where('username', 'CSV005')->value('email'))->toBe('original@example.test');
});

test('unreleased students cannot log in or use forgotten password to bypass Admin release', function () {
    $student = invitationTestUser();
    $this->post('/login', ['email' => $student->email, 'password' => 'original-password'])->assertSessionHasErrors('email');
    $this->assertGuest();
    $this->post('/forgot-password', ['email' => $student->email])->assertSessionHasNoErrors();
    Notification::assertNothingSent();
    expect(DB::table('password_reset_tokens')->count())->toBe(0);
    $token = Password::createToken($student);
    $this->post('/reset-password', ['email' => $student->email, 'token' => $token, 'password' => 'new-password', 'password_confirmation' => 'new-password'])
        ->assertSessionHasErrors('email');
    expect($student->fresh()->student_password_set_at)->toBeNull();
});

test('bulk invitation only queues new uninvited students and repeated clicks do not duplicate jobs', function () {
    $admin = invitationTestUser('Admin');
    $new = invitationTestUser();
    $sent = invitationTestUser();
    $sent->forceFill(['student_access_released_at' => now(), 'student_invitation_status' => 'sent', 'student_invitation_sent_at' => now()])->save();
    $active = invitationTestUser();
    $active->forceFill(['student_access_released_at' => now(), 'student_password_set_at' => now(), 'student_invitation_status' => 'active'])->save();
    $payload = ['user_ids' => [$new->user_id, $sent->user_id, $active->user_id]];
    $this->actingAs($admin)->post(route('admin.students.invitations.store'), $payload)->assertSessionHasNoErrors();
    $this->post(route('admin.students.invitations.store'), $payload)->assertSessionHasNoErrors();
    Queue::assertPushed(SendStudentAccountInvitation::class, 1);
    expect($new->fresh()->student_invitation_status)->toBe('queued');
    expect($new->fresh()->student_access_released_at)->not->toBeNull();
    expect($sent->fresh()->student_invitation_status)->toBe('sent');
    expect($active->fresh()->student_invitation_status)->toBe('active');
    Notification::assertNothingSent();
});

test('newly added students remain independently eligible after an earlier batch was invited', function () {
    $admin = invitationTestUser('Admin');
    $first = invitationTestUser();
    $service = app(StudentAccountInvitations::class);
    $service->queue($first, $admin);
    $this->travel(2)->days();
    $second = invitationTestUser();
    $this->actingAs($admin)->post(route('admin.students.invitations.store'), ['user_ids' => [$first->user_id, $second->user_id]])->assertSessionHasNoErrors();
    Queue::assertPushed(SendStudentAccountInvitation::class, 2);
    expect($second->fresh()->student_invitation_status)->toBe('queued');
});

test('invitation job sends a setup email once and an authenticated student stays blocked until setup', function () {
    $admin = invitationTestUser('Admin');
    $student = invitationTestUser();
    $service = app(StudentAccountInvitations::class);
    $service->queue($student, $admin);
    $attempt = $student->fresh()->student_invitation_attempt_id;
    $service->deliver($student->user_id, $attempt);
    $service->deliver($student->user_id, $attempt);
    Notification::assertSentToTimes($student, StudentAccountInvitation::class, 1);
    $notification = Notification::sent($student, StudentAccountInvitation::class)->first();
    expect($notification->toMail($student)->actionUrl)->toContain('/set-password/');
    expect($student->fresh()->student_invitation_status)->toBe('sent');
    $this->post('/login', ['email' => $student->email, 'password' => 'original-password'])->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('setup links work beyond one hour activate the student and can be used only once', function () {
    $admin = invitationTestUser('Admin');
    $student = invitationTestUser();
    $service = app(StudentAccountInvitations::class);
    $service->queue($student, $admin);
    $service->deliver($student->user_id, $student->fresh()->student_invitation_attempt_id);
    $token = Notification::sent($student, StudentAccountInvitation::class)->first()->token;
    $this->travel(2)->hours();
    $payload = ['email' => $student->email, 'token' => $token, 'password' => 'chosen-password', 'password_confirmation' => 'chosen-password'];
    $this->post('/set-password', $payload)->assertRedirect(route('login'))->assertSessionHasNoErrors();
    expect($student->fresh()->student_invitation_status)->toBe('active');
    expect($student->fresh()->student_password_set_at)->not->toBeNull();
    expect(Hash::check('chosen-password', $student->fresh()->password))->toBeTrue();
    $this->post('/set-password', $payload)->assertSessionHasErrors('email');
    $this->post('/login', ['email' => $student->email, 'password' => 'chosen-password'])->assertRedirect(route('student.dashboard'));
    $this->assertAuthenticatedAs($student);
});

test('setup links expire after 24 hours and cannot be used as regular reset tokens', function () {
    $student = invitationTestUser();
    $student->forceFill(['student_access_released_at' => now()])->save();
    $token = Password::broker('student_invitations')->createToken($student);
    $payload = ['email' => $student->email, 'token' => $token, 'password' => 'chosen-password', 'password_confirmation' => 'chosen-password'];
    $this->post('/reset-password', $payload)->assertSessionHasErrors('email');
    $this->travel(25)->hours();
    $this->post('/set-password', $payload)->assertSessionHasErrors('email');
    expect(Hash::check('original-password', $student->fresh()->password))->toBeTrue();
});

test('released students may recover a lost invitation through normal forgotten password', function () {
    $student = invitationTestUser();
    $student->forceFill(['student_access_released_at' => now(), 'student_invitation_status' => 'sent'])->save();
    $invite = Password::broker('student_invitations')->createToken($student);
    $this->post('/forgot-password', ['email' => $student->email])->assertSessionHasNoErrors();
    $reset = Notification::sent($student, ResetPassword::class)->first();
    $this->post('/reset-password', ['email' => $student->email, 'token' => $reset->token, 'password' => 'chosen-password', 'password_confirmation' => 'chosen-password'])
        ->assertSessionHasNoErrors();
    expect($student->fresh()->student_invitation_status)->toBe('active');
    expect(Password::broker('student_invitations')->tokenExists($student, $invite))->toBeFalse();
});

test('resending is separate and replaces the previous setup link without changing the password', function () {
    $admin = invitationTestUser('Admin');
    $student = invitationTestUser();
    $service = app(StudentAccountInvitations::class);
    $service->queue($student, $admin);
    $service->deliver($student->user_id, $student->fresh()->student_invitation_attempt_id);
    $oldToken = Notification::sent($student, StudentAccountInvitation::class)->first()->token;
    $this->travel(2)->minutes();
    $this->actingAs($admin)->post(route('admin.students.invitations.resend', $student))->assertSessionHasNoErrors();
    $service->deliver($student->user_id, $student->fresh()->student_invitation_attempt_id);
    Notification::assertSentToTimes($student, StudentAccountInvitation::class, 2);
    expect(Password::broker('student_invitations')->tokenExists($student, $oldToken))->toBeFalse();
    expect(Hash::check('original-password', $student->fresh()->password))->toBeTrue();
});

test('failed deliveries can be retried and stale jobs cannot clobber the new attempt', function () {
    $admin = invitationTestUser('Admin');
    $student = invitationTestUser();
    $service = app(StudentAccountInvitations::class);
    $service->queue($student, $admin);
    $oldJob = new SendStudentAccountInvitation($student->user_id, $student->fresh()->student_invitation_attempt_id);
    $oldJob->failed(new RuntimeException('Simulated mail failure'));
    expect($student->fresh()->student_invitation_status)->toBe('failed');
    $this->actingAs($admin)->post(route('admin.students.invitations.resend', $student))->assertSessionHasNoErrors();
    $oldJob->failed(new RuntimeException('Stale failure'));
    $oldJob->handle($service);
    expect($student->fresh()->student_invitation_status)->toBe('queued');
    Notification::assertNothingSent();
});

test('editing an awaiting students email cancels old links and stale queued jobs', function () {
    $admin = invitationTestUser('Admin');
    $student = invitationTestUser();
    $service = app(StudentAccountInvitations::class);
    $service->queue($student, $admin);
    $oldAttempt = $student->fresh()->student_invitation_attempt_id;
    $oldToken = Password::broker('student_invitations')->createToken($student);
    $this->actingAs($admin)->put(route('admin.manage-users.update', $student), ['email' => 'corrected@example.test'])->assertSessionHasNoErrors();
    expect($student->fresh()->student_invitation_status)->toBe('not_invited');
    expect($student->fresh()->student_access_released_at)->toBeNull();
    $service->deliver($student->user_id, $oldAttempt);
    Notification::assertNothingSent();
    expect(DB::table('student_invitation_tokens')->where('email', $student->email)->exists())->toBeFalse();
});

test('active students are skipped even when their old invitation is resent', function () {
    $admin = invitationTestUser('Admin');
    $student = invitationTestUser();
    $student->forceFill(['student_access_released_at' => now(), 'student_password_set_at' => now(), 'student_invitation_status' => 'active'])->save();
    $this->actingAs($admin)->post(route('admin.students.invitations.resend', $student))->assertSessionHasNoErrors();
    Queue::assertNothingPushed();
});

test('students cannot release their own accounts', function () {
    $student = invitationTestUser();
    $this->actingAs($student)->post(route('admin.students.invitations.store'), ['user_ids' => [$student->user_id]])->assertRedirect();
    Queue::assertNothingPushed();
    expect($student->fresh()->student_access_released_at)->toBeNull();
});

test('student setup requires matching passwords and cannot be performed before release', function () {
    $student = invitationTestUser();
    $token = Password::broker('student_invitations')->createToken($student);
    $payload = ['email' => $student->email, 'token' => $token, 'password' => 'chosen-password', 'password_confirmation' => 'chosen-password'];
    $this->post('/set-password', $payload)->assertSessionHasErrors('email');
    $student->forceFill(['student_access_released_at' => now()])->save();
    $this->post('/set-password', [...$payload, 'password_confirmation' => 'different-password'])->assertSessionHasErrors('password');
    expect($student->fresh()->student_password_set_at)->toBeNull();
});

test('fresh student seed accounts are staged and reseeding preserves edited emails passwords and access', function () {
    Schema::create('companies', function (Blueprint $table) {
        $table->id('company_id');
        $table->string('company_name');
    });
    foreach (\Database\Seeders\Support\DemoCompanies::all() as $company) {
        DB::table('companies')->insert(['company_name' => $company['name']]);
    }
    $this->seed(\Database\Seeders\UserSeeder::class);
    $student = User::where('username', '24FTT001')->firstOrFail();
    expect($student->student_invitation_status)->toBe('not_invited');
    expect(Hash::check('password123', $student->password))->toBeFalse();
    $student->forceFill([
        'email' => 'edited-student@example.test', 'student_access_released_at' => now(),
        'student_password_set_at' => now(), 'student_invitation_status' => 'active',
    ])->save();
    $password = $student->password;
    $this->seed(\Database\Seeders\UserSeeder::class);
    expect($student->fresh()->email)->toBe('edited-student@example.test');
    expect($student->fresh()->password)->toBe($password);
    expect($student->fresh()->student_invitation_status)->toBe('active');
    Notification::assertNothingSent();
});

test('the migration preserves existing student passwords and access without sending invitations', function () {
    $student = invitationTestUser();
    $password = $student->password;
    $migration = require database_path('migrations/2026_10_20_000003_add_student_account_invitations.php');
    $migration->down();
    $migration->up();
    expect($student->fresh()->password)->toBe($password);
    expect($student->fresh()->student_invitation_status)->toBe('active');
    expect($student->fresh()->student_access_released_at)->not->toBeNull();
    Notification::assertNothingSent();
    Queue::assertNothingPushed();
});
