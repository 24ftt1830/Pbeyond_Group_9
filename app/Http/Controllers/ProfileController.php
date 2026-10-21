<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\AcademicSupervisor;
use App\Models\IndustrySupervisor;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function supervisor(Request $request): Response
    {
        $user = $request->user();
        abort_unless(in_array($user->role, ['Academic Supervisor', 'Industry Supervisor'], true), 403);
        $isIndustry = $user->role === 'Industry Supervisor';
        $supervisor = $isIndustry
            ? IndustrySupervisor::with('company')->where('user_id', $user->getKey())->first()
            : AcademicSupervisor::where('user_id', $user->getKey())->first();

        return Inertia::render('Supervisor/Profile', [
            'supervisorType' => $isIndustry ? 'industry' : 'academic',
            'supervisor' => $supervisor ? [
                'full_name' => $supervisor->full_name,
                'email' => $user->email,
                'phone' => $supervisor->phone,
                ...($isIndustry ? [
                    'company_name' => $supervisor->company?->company_name,
                    'position' => $supervisor->position,
                ] : []),
            ] : null,
        ]);
    }

    public function updateSupervisor(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->role, ['Academic Supervisor', 'Industry Supervisor'], true), 403);
        $isIndustry = $user->role === 'Industry Supervisor';
        $data = $request->validate([
            'full_name' => ['required', 'string', $isIndustry ? 'max:150' : 'max:255'],
            'phone' => ['nullable', 'string', $isIndustry ? 'max:20' : 'max:255'],
        ]);
        $supervisor = ($isIndustry ? IndustrySupervisor::query() : AcademicSupervisor::query())
            ->where('user_id', $user->getKey())->firstOrFail();
        $supervisor->update($data);

        return Redirect::route($isIndustry ? 'industry-supervisor.profile' : 'academic-supervisor.profile');
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $user = $request->user();
            $user->save();
            if ($user->role === 'Academic Supervisor') {
                \App\Models\AcademicSupervisor::where('user_id', $user->getKey())->update(['email' => $user->email]);
            } elseif ($user->role === 'Industry Supervisor') {
                \App\Models\IndustrySupervisor::where('user_id', $user->getKey())->update(['email' => $user->email]);
            }
        });

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
