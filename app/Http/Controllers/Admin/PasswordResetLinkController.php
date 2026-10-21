<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminRecordChange;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    public function store(Request $request, User $user): RedirectResponse
    {
        abort_unless(in_array($user->role, ['Company', 'Academic Supervisor', 'Industry Supervisor', 'Student'], true), 404);
        if ($user->requiresStudentPasswordSetup()) {
            throw ValidationException::withMessages(['reset_link' => 'Use the student invitation action until this student has completed password setup.']);
        }

        // Always use the saved account email, never an address supplied by the caller.
        try {
            $status = Password::sendResetLink(['email' => $user->email]);
        } catch (\Throwable $exception) {
            report($exception);

            throw ValidationException::withMessages([
                'reset_link' => 'The reset email could not be sent. Please try again shortly or check the email configuration.',
            ]);
        }

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages(['reset_link' => __($status)]);
        }

        AdminRecordChange::record($request->user(), $user, 'Sent password reset link');

        return back()->with('status', __($status));
    }
}
