<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\IndustrySupervisor;
use Illuminate\Http\Request;
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
            ->with('user')
            ->get();

        return Inertia::render('Company/ManageUsers', [
            'industrySupervisors' => $industrySupervisors,
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
            'position' => 'nullable|string|max:255',
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
                'position' => $validated['position'] ?? null,
            ]);
        });

        return redirect()
            ->route('company.manage-users')
            ->with('success', 'Industry Supervisor created successfully.');
    }
}