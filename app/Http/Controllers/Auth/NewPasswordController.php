<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    public function createSetup(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'setup' => true,
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        return $this->resetPassword($request, config('auth.defaults.passwords'));
    }

    public function storeSetup(Request $request): RedirectResponse
    {
        return $this->resetPassword($request, 'student_invitations', true);
    }

    private function resetPassword(Request $request, string $broker, bool $setup = false): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = DB::transaction(function () use ($request, $broker, $setup) {
            $account = User::where('email', $request->email)->lockForUpdate()->first();
            if (! $account || $account->studentAccessIsUnreleased()
                || ($setup && ! $account->requiresStudentPasswordSetup())) {
                return Password::INVALID_TOKEN;
            }

            return Password::broker($broker)->reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user) use ($request) {
                    $changes = [
                        'password' => Hash::make($request->password),
                        'remember_token' => Str::random(60),
                    ];
                    if ($user->requiresStudentPasswordSetup()) {
                        $changes += [
                            'student_password_set_at' => now(),
                            'student_invitation_status' => 'active',
                            'student_invitation_attempt_id' => null,
                            'student_invitation_error' => null,
                        ];
                    }
                    $user->forceFill($changes)->save();
                    Password::deleteToken($user);
                    Password::broker('student_invitations')->deleteToken($user);
                    event(new PasswordReset($user));
                }
            );
        });

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', $setup ? 'Password set successfully. You can now log in.' : __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
