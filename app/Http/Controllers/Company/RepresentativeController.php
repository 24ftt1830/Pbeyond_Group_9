<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RepresentativeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $company = Company::where('company_id', $user->company_id)->first();

        $representatives = [];

        if ($company) {
            $representatives = User::where('role', 'Company')
                ->where('company_id', $company->company_id)
                ->get();
        }

        return Inertia::render('Company/Representatives', [
            'company' => $company,
            'representatives' => $representatives,
        ]);
    }
}