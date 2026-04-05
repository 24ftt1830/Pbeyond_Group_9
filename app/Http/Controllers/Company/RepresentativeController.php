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

        $company = Company::where('user_id', $user->user_id)->first();

        $representatives = [];

        if ($company) {
            $representatives = User::where('role', 'Company')
                ->whereHas('company', function($query) use ($company) {
                    $query->where('company_id', $company->company_id);
                })
                ->get();
        }

        return Inertia::render('Company/Representatives', [
            'company' => $company,
            'representatives' => $representatives,
        ]);
    }
}