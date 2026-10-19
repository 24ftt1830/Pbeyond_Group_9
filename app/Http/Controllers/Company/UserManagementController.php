<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\IndustrySupervisor;
use App\Models\Student;
use App\Services\IndustrySupervisorAssignments;
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
        abort_unless($companyId, 403, 'Your account is not linked to a company.');

        $industrySupervisors = IndustrySupervisor::where(
            'company_id',
            $companyId
        )
            ->with(['user', 'students:students.student_id,full_name,pb_student_code'])
            ->get();

        $students = Student::whereHas('applications', fn ($query) => $query->where('app_status', 'Recruited')
            ->whereHas('quota', fn ($quota) => $quota->where('company_id', $companyId)))
            ->with(['programme', 'supervisorAssignments'])
            ->orderBy('full_name')->get();

        return Inertia::render('Company/ManageUsers', [
            'industrySupervisors' => $industrySupervisors,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $companyId = Auth::user()->company_id;
        abort_unless($companyId, 403, 'Your account is not linked to a company.');

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'student_ids' => ['present', 'array'],
            'student_ids.*' => ['required', 'integer', 'distinct', 'exists:students,student_id'],
        ]);

        DB::transaction(function () use ($validated, $companyId, $request) {

            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'Industry Supervisor',
                'company_id' => $companyId,
            ]);

            $supervisor = IndustrySupervisor::create([
                'user_id' => $user->user_id,
                'company_id' => $companyId,
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'quota_id' => null,
            ]);
            app(IndustrySupervisorAssignments::class)->sync($supervisor, $validated['student_ids'], $request->user());
        });

        return redirect()
            ->route('company.manage-users')
            ->with('success', 'Industry Supervisor created successfully.');
    }

    public function assign(Request $request, IndustrySupervisor $supervisor)
    {
        abort_unless((int) $supervisor->company_id === (int) $request->user()->company_id, 403);
        $data = $request->validate([
            'student_ids' => ['present', 'array'],
            'student_ids.*' => ['required', 'integer', 'distinct', 'exists:students,student_id'],
        ]);
        app(IndustrySupervisorAssignments::class)->sync($supervisor, $data['student_ids'], $request->user());
        return back()->with('success', 'Industry Supervisor student assignments updated.');
    }
}
