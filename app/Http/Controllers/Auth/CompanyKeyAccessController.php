<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CompanyKeyAccessController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/CompanyKeyAccess');
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'access_key' => ['required', 'digits:6'],
        ]);

        $company = Company::query()
            ->whereNotNull('access_key')
            ->get(['company_id', 'company_name', 'access_key', 'access_key_expires_at'])
            ->first(fn (Company $company) => Hash::check($validated['access_key'], $company->access_key));

        if (! $company) {
            return back()->withErrors([
                'access_key' => 'Invalid company access key. Please check with your Admin.',
            ]);
        }

        if ($company->access_key_expires_at?->isPast()) {
            return back()->withErrors([
                'access_key' => 'This access key has expired. Please contact your Admin.',
            ]);
        }

        $request->session()->put([
            'verified_company_id' => $company->company_id,
            'verified_company_name' => $company->company_name,
        ]);

        return redirect()->route('company.login-form');
    }
}
