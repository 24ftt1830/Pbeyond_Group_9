<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\IndustrySupervisor;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RepresentativeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $company = Company::where(
            'company_id',
            $user->company_id
        )->first();

        $representatives = [];

        if ($company) {
            // Company users
            $companyUsers = User::where('role', 'Company')
                ->where('company_id', $company->company_id)
                ->get()
                ->map(function ($companyUser) {
                    return [
                        'user_id' => $companyUser->user_id,
                        'username' => $companyUser->username,
                        'email' => $companyUser->email,
                        'role' => 'Company',
                    ];
                });

            // Industry Supervisors belonging to this company
            $industrySupervisors = IndustrySupervisor::where(
                'company_id',
                $company->company_id
            )
                ->with('user')
                ->get()
                ->map(function ($supervisor) {
                    return [
                        'user_id' => $supervisor->user_id,
                        'username' => $supervisor->full_name,
                        'email' => $supervisor->user?->email ?? $supervisor->email,
                        'role' => 'Industry Supervisor',
                    ];
                });

            $representatives = $companyUsers
                ->concat($industrySupervisors)
                ->values();
        }

        return Inertia::render('Company/Representatives', [
            'company' => $company,
            'representatives' => $representatives,
        ]);
    }
}