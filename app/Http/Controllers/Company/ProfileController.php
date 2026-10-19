<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\CompanyBranchManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Display the company profile page.
     */
    public function index()
    {
        return Inertia::render('Company/Profile', [
            'user' => Auth::user()->load('company.branches'),
        ]);
    }

    /**
     * Display the company profile page.
     */
    public function show()
    {
        return Inertia::render('Company/Profile', [
            'user' => Auth::user()->load('company.branches'),
        ]);
    }

    /**
     * Update the authenticated user's account and company profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $company = $user->company;

        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->user_id, 'user_id')],
            'company_name' => 'required|string|max:255',
            'office_address' => 'nullable|string|max:255',
            'industry_sector' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'additional_information' => 'nullable|string',
        ] + CompanyBranchManager::rules());

        DB::transaction(function () use ($user, $company, $validated) {
        $user->update([
            'username' => $validated['username'],
            'email' => $validated['email'],
        ]);

        // Update related company information
        if ($company) {
            $company->update([
                'company_name' => $validated['company_name'],
                'office_address' => $validated['office_address'],
                'industry_sector' => $validated['industry_sector'],
                'description' => $validated['description'],
                'additional_information' => $validated['additional_information'],
                'district' => $validated['district'] ?? null,
            ]);
            if (array_key_exists('branches', $validated)) {
                app(CompanyBranchManager::class)->sync($company, $validated['branches']);
            }
        }
        });

        return back()->with('success', 'Company profile updated successfully.');
    }
}
