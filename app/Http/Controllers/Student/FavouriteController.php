<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Inertia\Inertia;

class FavouriteController extends Controller
{
    public function index()
{
    $student = auth()->user()->student;

    // Get approved, released quotas that match student's programme, have available slots,
    // and the student hasn't applied to.
    $appliedQuotaIds = $student->applications()->pluck('quota_id')->toArray();

    $recommendedQuotas = PlacementQuota::with('company')
        ->where('programme_id', $student->programme_id)
        ->where('is_released', true)
        ->where('quota_status', 'Approved')
        ->whereNotIn('quota_id', $appliedQuotaIds)
        ->whereRaw('total_slots > (SELECT COUNT(*) FROM applications WHERE applications.quota_id = placement_quotas.quota_id AND applications.app_status = "Approved")')
        ->orderBy('min_cgpa')
        ->get()
        ->map(fn($quota) => [
            'id'       => $quota->company->company_id,
            'name'     => $quota->company->company_name,
            'job_title'=> $quota->job_title,
            'slots'    => $quota->total_slots - $quota->applications()->where('app_status', 'Approved')->count(),
            'min_cgpa' => $quota->min_cgpa,
            'district' => $quota->company->district ?? 'Brunei-Muara',
            'school'   => $quota->company->school ?? 'SICT',
        ]);

    return Inertia::render('Student/Favourites', [
        'recommendations' => $recommendedQuotas,
    ]);
}

//     public function destroy($companyId)
//     {
//         auth()->user()->favourites()->where('company_id', $companyId)->delete();
//         return back()->with('success', 'Removed from favourites.');
//     }
}
