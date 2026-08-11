<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        
        if ($request->user() && $request->user()->role !== $role) {
            // Redirect based on their actual role if they try to access wrong route
            return redirect(match ($request->user()->role) {
                'Admin' => '/admin/dashboard',
                'Student' => '/student/dashboard',
                'Company' => '/company/dashboard',
                default => '/',
            })->with('error', 'Unauthorized access.');
        }

        return $next($request);
    }
}
