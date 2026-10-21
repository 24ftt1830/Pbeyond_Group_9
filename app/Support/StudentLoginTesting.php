<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

final class StudentLoginTesting
{
    public static function enabled(): bool
    {
        return app()->environment('local') && config('auth.student_testing_login', false);
    }

    /** Authenticate local student demos without changing real credentials or invitation state. */
    public static function authenticate(array $credentials, bool $remember): bool
    {
        if (! self::enabled() || ($credentials['password'] ?? null) !== 'password123') {
            return false;
        }

        $student = User::where('email', $credentials['email'] ?? '')
            ->where('role', 'Student')->first();

        if (! $student) {
            return false;
        }

        Auth::login($student, $remember);

        return true;
    }
}
