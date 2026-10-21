<?php

use App\Http\Middleware\ExpireQuotaRequests;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;

uses(Tests\TestCase::class);

beforeEach(function () {
    // Match the project's isolated SQLite checks, avoiding legacy MySQL-only migrations.
    config([
        'database.default' => 'password_recovery_tests',
        'database.connections.password_recovery_tests' => [
            'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '',
            'foreign_key_constraints' => true,
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
    Notification::fake();
});

function passwordRecoveryUser(string $role = 'Student'): User
{
    $number = User::count() + 1;
    $user = User::create([
        'username' => 'recovery-user-'.$number,
        'email' => 'recovery-'.$number.'@example.test',
        'password' => Hash::make('old-password'),
        'role' => $role,
        'company_id' => $role === 'Company' ? $number : null,
    ]);
    if ($role === 'Student') {
        $user->forceFill(['student_access_released_at' => now(), 'student_password_set_at' => now(), 'student_invitation_status' => 'active'])->save();
    }
    return $user;
}

test('forgotten passwords automatically send links for every role without an admin', function (string $role) {
    $user = passwordRecoveryUser($role);
    $originalPassword = $user->password;

    $this->from('/forgot-password')->post('/forgot-password', ['email' => $user->email])
        ->assertRedirect('/forgot-password')->assertSessionHasNoErrors();

    Notification::assertSentTo($user, ResetPassword::class);
    expect($user->fresh()->password)->toBe($originalPassword);
    expect(DB::table('admin_record_changes')->count())->toBe(0);
})->with(['Company', 'Academic Supervisor', 'Industry Supervisor', 'Student', 'Admin']);

test('admin sends the same reset link to the saved HR or supervisor email and records the action', function (string $role) {
    $admin = passwordRecoveryUser('Admin');
    $recipient = passwordRecoveryUser($role);
    $originalPassword = $recipient->password;

    $this->actingAs($admin)->from('/admin/manage-users')
        ->post(route('admin.manage-users.password-reset', $recipient), ['email' => 'different@example.test'])
        ->assertRedirect('/admin/manage-users')->assertSessionHasNoErrors();

    Notification::assertSentTo($recipient, ResetPassword::class);
    expect($recipient->fresh()->password)->toBe($originalPassword);
    $this->assertDatabaseHas('admin_record_changes', [
        'user_id' => $admin->user_id, 'subject_id' => $recipient->user_id,
        'action' => 'Sent password reset link',
    ]);
})->with(['Company', 'Academic Supervisor', 'Industry Supervisor', 'Student']);

test('non admins cannot send reset links through the admin action', function (string $role) {
    $actor = passwordRecoveryUser($role);
    $recipient = passwordRecoveryUser('Academic Supervisor');
    $this->actingAs($actor)->post(route('admin.manage-users.password-reset', $recipient))->assertRedirect();
    Notification::assertNothingSent();
})->with(['Company', 'Academic Supervisor', 'Industry Supervisor', 'Student']);

test('guests cannot use the admin reset action', function () {
    $recipient = passwordRecoveryUser('Company');
    $this->post(route('admin.manage-users.password-reset', $recipient))->assertRedirect(route('login'));
    Notification::assertNothingSent();
});

test('admin reset action does not support other admin accounts', function () {
    $admin = passwordRecoveryUser('Admin');
    $student = passwordRecoveryUser('Admin');
    $this->actingAs($admin)->post(route('admin.manage-users.password-reset', $student))->assertNotFound();
    Notification::assertNothingSent();
});

test('self service and admin share the same per account reset cooldown', function () {
    $recipient = passwordRecoveryUser('Company');
    $this->post('/forgot-password', ['email' => $recipient->email])->assertSessionHasNoErrors();
    $admin = passwordRecoveryUser('Admin');
    $this->actingAs($admin)->post(route('admin.manage-users.password-reset', $recipient))
        ->assertSessionHasErrors('reset_link');
    Notification::assertSentToTimes($recipient, ResetPassword::class, 1);
});

test('a reset link changes the password once and uses a hashed token', function () {
    $user = passwordRecoveryUser('Company');
    $this->post('/forgot-password', ['email' => $user->email]);
    $notification = Notification::sent($user, ResetPassword::class)->first();
    expect(DB::table('password_reset_tokens')->value('token'))->not->toBe($notification->token);
    $payload = [
        'email' => $user->email, 'token' => $notification->token,
        'password' => 'new-password', 'password_confirmation' => 'new-password',
    ];
    $this->post('/reset-password', $payload)->assertRedirect(route('login'))->assertSessionHasNoErrors();
    expect(Hash::check('new-password', $user->fresh()->password))->toBeTrue();
    expect($user->fresh()->remember_token)->not->toBeNull();
    $this->post('/reset-password', $payload)->assertSessionHasErrors('email');
});

test('expired reset links cannot replace a password', function () {
    $user = passwordRecoveryUser('Industry Supervisor');
    $this->post('/forgot-password', ['email' => $user->email]);
    $notification = Notification::sent($user, ResetPassword::class)->first();
    $this->travel(61)->minutes();
    $this->post('/reset-password', [
        'email' => $user->email, 'token' => $notification->token,
        'password' => 'new-password', 'password_confirmation' => 'new-password',
    ])->assertSessionHasErrors('email');
    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

test('reset tokens cannot be used for a different account or mismatched passwords', function () {
    $user = passwordRecoveryUser('Academic Supervisor');
    $other = passwordRecoveryUser('Industry Supervisor');
    $token = Password::createToken($user);
    $this->post('/reset-password', [
        'email' => $other->email, 'token' => $token,
        'password' => 'new-password', 'password_confirmation' => 'new-password',
    ])->assertSessionHasErrors('email');
    $this->post('/reset-password', [
        'email' => $user->email, 'token' => $token,
        'password' => 'new-password', 'password_confirmation' => 'different-password',
    ])->assertSessionHasErrors('password');
    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

test('logged in HR and supervisors can change passwords and invalidate pending reset links', function (string $role) {
    $user = passwordRecoveryUser($role);
    $token = Password::createToken($user);
    $this->actingAs($user)->from('/profile')->put('/password', [
        'current_password' => 'old-password', 'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertRedirect('/profile')->assertSessionHasNoErrors();
    expect(Hash::check('new-password', $user->fresh()->password))->toBeTrue();
    expect(Password::tokenExists($user, $token))->toBeFalse();
})->with(['Company', 'Academic Supervisor', 'Industry Supervisor']);

test('changing a password requires the correct current password and matching confirmation', function () {
    $user = passwordRecoveryUser('Company');
    $this->actingAs($user)->put('/password', [
        'current_password' => 'wrong-password', 'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertSessionHasErrors('current_password');
    $this->put('/password', [
        'current_password' => 'old-password', 'password' => 'new-password',
        'password_confirmation' => 'different-password',
    ])->assertSessionHasErrors('password');
    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

test('admin cannot directly replace an existing HR password through account editing', function () {
    $admin = passwordRecoveryUser('Admin');
    $recipient = passwordRecoveryUser('Company');
    $this->actingAs($admin)->put(route('admin.manage-users.update', $recipient->user_id), [
        'password' => 'replacement-password',
    ])->assertSessionHasErrors('password');
    expect(Hash::check('old-password', $recipient->fresh()->password))->toBeTrue();
});

test('email sending failures produce a validation message instead of claiming success', function (bool $adminAction) {
    $recipient = passwordRecoveryUser('Company');
    Password::shouldReceive('sendResetLink')->once()->with(['email' => $recipient->email])
        ->andThrow(new RuntimeException('Test mail transport failure'));
    if ($adminAction) {
        $this->actingAs(passwordRecoveryUser('Admin'))
            ->post(route('admin.manage-users.password-reset', $recipient))->assertSessionHasErrors('reset_link');
    } else {
        $this->post('/forgot-password', ['email' => $recipient->email])->assertSessionHasErrors('email');
    }
    Notification::assertNothingSent();
    expect(Hash::check('old-password', $recipient->fresh()->password))->toBeTrue();
})->with([false, true]);

test('password support migration can run when its table and column already exist', function () {
    (require database_path('migrations/2026_10_20_000002_add_password_reset_support.php'))->up();
    expect(Schema::hasTable('password_reset_tokens'))->toBeTrue();
    expect(Schema::hasColumn('users', 'remember_token'))->toBeTrue();
});
