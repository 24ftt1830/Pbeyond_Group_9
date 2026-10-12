<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\PlacementQuota;
use App\Models\AdminRecordChange;
use App\Models\Company;
use App\Models\Programme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class QuotaController extends Controller
{
    /**
     * Display the company's own quotas and available programmes.
     */
    public function index()
    {
        $user = Auth::user();

        $quotas = $user->company
            ? $user->company->placementQuotas()
                ->with(['programme', 'programmes.school'])
                ->latest()
                ->get()
            : [];

        return Inertia::render('Company/Quotas', [
            'quotas' => $quotas,
            'programmes' => Programme::with('school')
                ->select(
                    'programme_id',
                    'programme_name',
                    'school_id'
                )
                ->get(),
            'company' => $user->company,
        ]);
    }

    /**
     * Store a newly created quota.
     */
    public function store(Request $request, ?Company $company = null)
    {
        $user = Auth::user();
        if ($company) {
            abort_unless($user->role === 'Admin', 403);
        }
        $company ??= $user->company;

        if (!$company) {
            return redirect()->back()->withErrors([
                'message' => 'You must have a company profile to submit quotas.',
            ]);
        }

        $validated = $request->validate([
            'programme_ids' => [
                'required',
                'array',
                'min:3',
                'max:5',
            ],

            'programme_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:programmes,programme_id',
            ],

            'job_title' => [
                'required',
                'string',
                'max:150',
            ],

            'skills' => [
                'nullable',
                'array',
            ],

            'skills.*' => [
                'string',
                'max:50',
            ],

            'total_slots' => [
                'required',
                'integer',
                'min:1',
            ],

            'interview_required' => [
                'required',
                'boolean',
            ],
        ], [
            'programme_ids.required' => 'Please select at least 3 programmes.',
            'programme_ids.min' => 'Please select at least 3 programmes.',
            'programme_ids.max' => 'You can select a maximum of 5 programmes.',
            'programme_ids.*.distinct' => 'You cannot select the same programme twice.',
        ]);

        DB::transaction(function () use ($company, $validated, $user) {
            $quota = $company->placementQuotas()->create([
                // Temporary compatibility with the old database column.
                // The real programme selection is stored in quota_programme.
                'programme_id' => $validated['programme_ids'][0],

                'job_title' => $validated['job_title'],
                'skills' => $validated['skills'] ?? [],
                'total_slots' => $validated['total_slots'],
                'interview_required' => $validated['interview_required'],
                'quota_status' => 'Pending',
                'is_released' => false,
            ]);

            // Attach the selected 3–5 programmes
            $quota->programmes()->sync($validated['programme_ids']);
            AdminRecordChange::record($user, $quota, 'Created job quota');
        });

        return redirect()->back()->with(
            'success',
            'Quota submitted for admin approval!'
        );
    }

    /**
     * Remove the specified quota.
     */
    public function destroy($id)
    {
        $quota = PlacementQuota::findOrFail($id);

        $user = Auth::user();

        if (
            $user->role !== 'Admin' && (!$user->company ||
            $quota->company_id !== $user->company->company_id
            )
        ) {
            abort(403, 'Unauthorized action.');
        }

        if ($quota->quota_status === 'Approved') {
            return redirect()->back()->withErrors([
                'message' => 'Cannot delete an approved quota.',
            ]);
        }

        if ($quota->applications()->exists()) {
            return back()->withErrors(['message' => 'A position with applications must be closed instead of deleted.']);
        }
        AdminRecordChange::record($user, $quota, 'Deleted job quota', $quota->toArray());
        $quota->delete();

        return redirect()->back()->with(
            'success',
            'Quota deleted.'
        );
    }

    /**
     * Update an existing quota.
     */
    public function update(Request $request, $id)
    {
        $quota = PlacementQuota::findOrFail($id);

        $user = Auth::user();

        if (
            $user->role !== 'Admin' && (!$user->company ||
            $quota->company_id !== $user->company->company_id
            )
        ) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'programme_ids' => [
                'required',
                'array',
                'min:3',
                'max:5',
            ],

            'programme_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:programmes,programme_id',
            ],

            'job_title' => [
                'required',
                'string',
                'max:150',
            ],

            'skills' => [
                'nullable',
                'array',
            ],

            'skills.*' => [
                'string',
                'max:50',
            ],

            'total_slots' => [
                'required',
                'integer',
                'min:1',
            ],

            'interview_required' => [
                'required',
                'boolean',
            ],
        ], [
            'programme_ids.required' => 'Please select at least 3 programmes.',
            'programme_ids.min' => 'Please select at least 3 programmes.',
            'programme_ids.max' => 'You can select a maximum of 5 programmes.',
            'programme_ids.*.distinct' => 'You cannot select the same programme twice.',
        ]);

        DB::transaction(function () use ($quota, $validated, $user) {
            $quota = PlacementQuota::whereKey($quota->getKey())->lockForUpdate()->firstOrFail();
            if ($validated['total_slots'] < $quota->applications()->whereIn('app_status', ['Recruited', 'Approved'])->count()) {
                throw ValidationException::withMessages(['total_slots' => 'Slots cannot be lower than the number of recruited students.']);
            }
            $before = $quota->toArray();
            $quota->update([
                // Temporary compatibility with the old database column.
                'programme_id' => $validated['programme_ids'][0],

                'job_title' => $validated['job_title'],
                'skills' => $validated['skills'] ?? [],
                'total_slots' => $validated['total_slots'],
                'interview_required' => $validated['interview_required'],
            ]);

            // Replace the quota's programme selections
            $quota->programmes()->sync($validated['programme_ids']);
            AdminRecordChange::record($user, $quota, 'Updated job quota', $before);
        });

        return back()->with(
            'success',
            'Quota updated successfully.'
        );
    }

    public function close($id)
    {
        $quota = PlacementQuota::findOrFail($id);
        abort_unless(auth()->user()->role === 'Admin' || (int) $quota->company_id === (int) auth()->user()->company_id, 403);
        $before = $quota->toArray();
        $quota->update(['is_released' => false]);
        AdminRecordChange::record(auth()->user(), $quota, 'Closed quota availability', $before);
        return back()->with('success', 'Position closed to new applications.');
    }
}
