<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\IndustrySupervisor;
use App\Models\PlacementQuota;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $companyId = Auth::user()->company_id;

        $industrySupervisors = IndustrySupervisor::where(
            'company_id',
            $companyId
        )
            ->with(['user', 'quota'])
            ->get();

        $quotas = PlacementQuota::available()
            ->where('company_id', $companyId)
            ->orderBy('job_title')
            ->get(['quota_id', 'job_title', 'total_slots']);

        return Inertia::render('Company/ManageUsers', [
            'industrySupervisors' => $industrySupervisors,
            'quotas' => $quotas,
        ]);
    }

    public function store(Request $request)
    {
        $companyId = Auth::user()->company_id;

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'quota_id' => [
                'required',
                'integer',
                Rule::exists('placement_quotas', 'quota_id')
                    ->where('company_id', $companyId)
                    ->where('quota_status', 'Approved')
                    ->where('is_released', true),
            ],
        ]);

        DB::transaction(function () use ($validated, $companyId) {

            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'Industry Supervisor',
                'company_id' => $companyId,
            ]);

            IndustrySupervisor::create([
                'user_id' => $user->user_id,
                'company_id' => $companyId,
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'quota_id' => $validated['quota_id'],
            ]);
        });

        return redirect()
            ->route('company.manage-users')
            ->with('success', 'Industry Supervisor created successfully.');
    }
}
