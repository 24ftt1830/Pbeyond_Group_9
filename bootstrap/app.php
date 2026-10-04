<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // role middleware alias
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);

        // If an authenticated user visits a guest page such as /login,
        // send them to their role dashboard instead of the public Welcome page.
        $middleware->redirectUsersTo(function (\Illuminate\Http\Request $request) {
            return match ($request->user()?->role) {
                'Admin' => route('admin.dashboard'),
                'Company' => route('company.dashboard'),
                'Student' => route('student.dashboard'),
                'Academic Supervisor' => route('academic-supervisor.dashboard'),
                'Industry Supervisor' => route('industry-supervisor.dashboard'),
                default => '/',
            };
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
