<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Inertia\Inertia;

class FavouriteController extends Controller
{
    public function index()
    {
        $favourites = auth()->user()->favourites()->with('company')->get()->map(function ($fav) {
            $company = $fav->company;
            // Compute availability (optional)
            return [
                'id'                  => $company->company_id,
                'name'                => $company->company_name,
                'status'              => 'Available',
                'quota_availability'  => 0,
                'interview_required'  => $company->interview_required ?? 'Depending on the course',
                'school'              => $company->school ?? 'SICT',
                'district'            => $company->district ?? 'Brunei-Muara',
            ];
        });

        return Inertia::render('Student/Favourites', ['favourites' => $favourites]);
    }

    public function store($companyId)
    {
        auth()->user()->favourites()->updateOrCreate(['company_id' => $companyId]);
        return back()->with('success', 'Added to favourites.');
    }

    public function destroy($companyId)
    {
        auth()->user()->favourites()->where('company_id', $companyId)->delete();
        return back()->with('success', 'Removed from favourites.');
    }
}
