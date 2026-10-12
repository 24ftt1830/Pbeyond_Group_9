<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $student = $user?->student;
        $missingProfileFields = $student?->getProfileCompletionIssues() ?? [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'student' => $student ? [
                        'student_id'      => $student->student_id,
                        'cv_snapshot'     => $student->cv_snapshot,
                        'cv_generated_at' => $student->cv_generated_at,
                        'profile_complete' => $missingProfileFields === [],
                        'missing_profile_fields' => $missingProfileFields,
                    ] : null,
                ]) : null,
            ],
            'flash' => [
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}
