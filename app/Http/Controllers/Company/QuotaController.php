<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\PlacementQuota;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotaController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Check if the user has a company associated with them
        // If not, return an empty collection instead of crashing
        $quotas = $user->company 
            ? $user->company->placementQuotas()->with('programme')->latest()->get()
            : collect(); 
        
        return Inertia::render('Company/Quotas', [
            'quotas' => $quotas
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->company) {
            return redirect()->back()->withErrors([
                'message' => 'You must have a company profile to submit quotas.'
            ]);
        }

        $validated = $request->validate([
            'programme_id' => 'required|exists:programmes,programme_id',
            'job_title'    => 'required|string|max:150',
            'total_slots'  => 'required|integer|min:1',
            'min_cgpa'     => 'required|numeric|min:0|max:4.0',
        ]);

        $user->company->placementQuotas()->create([
            'programme_id' => $validated['programme_id'],
            'job_title'    => $validated['job_title'],
            'total_slots'  => $validated['total_slots'],
            'min_cgpa'     => $validated['min_cgpa'],
            'quota_status' => 'Pending',
            'is_released'  => false,
        ]);

        return redirect()->back()->with('message', 'Quota submitted successfully!');
    }
    
    public function destroy(PlacementQuota $quota)
    {
        if (!$quota || $quota->company_id !== auth()->user()->company?->company_id) {
            abort(403);
        }

        $quota->delete();

        return redirect()->back();
    }
}