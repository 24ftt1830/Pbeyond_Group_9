<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyLoginController extends Controller
{
    public function create()
    {
        if (! session()->has('verified_company_id')) {
            return redirect()->route('company.key-access')
                ->withErrors(['access_key' => 'Enter your company access key first.']);
        }

        return Inertia::render('Auth/CompanyLogin', [
            'companyName' => session('verified_company_name'),
        ]);
    }

    public function login(Request $request)
    {
        if (! $request->session()->has('verified_company_id')) {
            return redirect()->route('company.key-access');
        }

        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])
            ->where('role', 'Company')
            ->where('company_id', $request->session()->get('verified_company_id'))
            ->whereNotNull('company_id')
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->forget(['verified_company_id', 'verified_company_name']);

        return redirect()->intended(route('company.dashboard'));
    }
}
