<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the company profile page.
     */
    public function index()
    {
        return Inertia::render('Company/Profile', [
            'user' => Auth::user()->load('company'),
        ]);
    }

    /**
     * Display the company profile page.
     */
    public function show()
    {
        return Inertia::render('Company/Profile', [
            'user' => Auth::user()->load('company'),
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
            'email' => 'required|email|max:255',
            'company_name' => 'required|string|max:255',
            'office_address' => 'nullable|string|max:255',
            'industry_sector' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'additional_information' => 'nullable|string',
        ]);

        // Update user account information
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
            ]);
        }

        return back()->with('success', 'Company profile updated successfully.');
    }
}