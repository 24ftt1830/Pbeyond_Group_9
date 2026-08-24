<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyKeyAccessController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/CompanyKeyAccess');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'access_key' => 'required|string|size:6',
        ]);

        $inputKey = trim($request->access_key);
        $companies = Company::whereNotNull('access_key')->get();
        $matchedCompany = null;

        foreach ($companies as $company) {
            if (Hash::check($inputKey, $company->access_key)) {
                $matchedCompany = $company;
                break;
            }
        }

        if (!$matchedCompany) {
            return back()->withErrors([
                'access_key' => 'Invalid company access key provided. Please check with your Admin.',
            ]);
        }

        if ($matchedCompany->access_key_expires_at && $matchedCompany->access_key_expires_at->isPast()) {
            return back()->withErrors([
                'access_key' => 'This access key has expired. Please contact Admin.',
            ]);
        }

        // Store verified company ID in session and move to credential login step
        session([
            'verified_company_id'   => $matchedCompany->company_id,
            'verified_company_name' => $matchedCompany->company_name,
        ]);

        return redirect()->route('company.login-form');
    }

    public function showLoginForm()
    {
        if (!session()->has('verified_company_id')) {
            return redirect()->route('company.key-access')
                ->withErrors(['access_key' => 'Please enter your 6-digit access key first.']);
        }

        return Inertia::render('Auth/CompanyLogin', [
            'companyName' => session('verified_company_name'),
        ]);
    }

    public function login(Request $request)
    {
        if (!session()->has('verified_company_id')) {
            return redirect()->route('company.key-access');
        }

        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $companyId = session('verified_company_id');

        $user = User::where('email', $request->email)
            ->where('company_id', $companyId)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        auth()->login($user);
        session()->forget(['verified_company_id', 'verified_company_name']);

        return redirect()->route('company.dashboard');
    }
}