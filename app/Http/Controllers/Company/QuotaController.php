<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\PlacementQuota;
use App\Models\Programme; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuotaController extends Controller
{
    /**
     * Display the company's own quotas and the list of available programmes.
     */
    public function index()
    {
        $user = Auth::user();
        
        $quotas = $user->company 
            ? $user->company->placementQuotas()->with('programme')->latest()->get() 
            : [];

        return Inertia::render('Company/Quotas', [
            'quotas' => $quotas,
            'programmes' => Programme::select('programme_id', 'programme_name')->get(),
            // Pass the company object so the frontend button guard works
            'company' => $user->company 
        ]);
    }

    /**
     * Store a newly created quota with a 'Pending' status.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->company) {
            return redirect()->back()->withErrors([
                'message' => 'You must have a company profile to submit quotas.'
            ]);
        }

        $validated = $request->validate([
            'programme_id' => 'required|integer|exists:programmes,programme_id',
            'job_title'    => 'required|string|max:150',
            'total_slots'  => 'required|integer|min:1',
            'min_cgpa'     => 'required|numeric|min:0|max:4.0',
            'interview_required' => 'required|boolean',
        ]);

        $user->company->placementQuotas()->create([
            'programme_id'       => $validated['programme_id'],
            'job_title'          => $validated['job_title'],
            'total_slots'        => $validated['total_slots'],
            'min_cgpa'           => $validated['min_cgpa'],
            'interview_required' => $validated['interview_required'],
            'quota_status'       => 'Pending', 
            'is_released'        => false,
            // 'job_description' => $request->job_description, // To be added if Text area is implemented
        ]);

        return redirect()->back()->with('success', 'Quota submitted for admin approval!');
    }

    /**
     * Remove the specified quota.
     */
    public function destroy($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        
        $user = Auth::user();

        if (!$user->company || $quota->company_id !== $user->company->company_id) {
            abort(403, 'Unauthorized action.');
        }

        if ($quota->quota_status === 'Approved') {
            return redirect()->back()->withErrors(['message' => 'Cannot delete an approved quota.']);
        }

        $quota->delete();

        return redirect()->back()->with('success', 'Quota deleted.');
    }
}