<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        abort_if($request->user()->requiresStudentPasswordSetup(), 403, 'Complete account setup through your invitation first.');
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        DB::transaction(function () use ($request, $validated) {
            $user = $request->user();
            $user->forceFill([
                'password' => Hash::make($validated['password']),
                'remember_token' => Str::random(60),
            ])->save();
            PasswordBroker::deleteToken($user);
            PasswordBroker::broker('student_invitations')->deleteToken($user);
        });

        return back();
    }
}
