<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Imports\StudentsImport;
use Maatwebsite\Excel\Facades\Excel;

class UserManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ManageUsers', [
            'companies' => Company::all(['company_id', 'company_name']),
            'programmes' => Programme::all(['programme_id', 'programme_name']),
            'companyUsers' => User::where('role', 'Company')
                ->with('company')
                ->get(),
            'students' => User::where('role', 'Student')
                ->with('student.programme')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:Company,Student',
        ];

        if ($request->role === 'Company') {
            $rules['company_id'] = 'nullable|exists:companies,company_id';
        } else {
            $rules['programme_id'] = 'required|exists:programmes,programme_id';
            $rules['pb_student_code'] = 'required|string|max:50|unique:students,pb_student_code';
        }

        $validated = $request->validate($rules);

        try {
            return DB::transaction(function () use ($validated) {
                $userData = [
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => $validated['role'],
                ];

                if ($validated['role'] === 'Company' && isset($validated['company_id'])) {
                    $userData['company_id'] = $validated['company_id'];
                }

                $user = User::create($userData);

                if ($user->role === 'Student') {
                    $user->student()->create([
                        'pb_student_code' => $validated['pb_student_code'],
                        'programme_id' => $validated['programme_id'],
                        'full_name' => $validated['username'],
                        'cgpa' => 0.0,
                    ]);
                    $message = 'Student account created successfully.';
                } else {
                    $message = 'Focal person created successfully.';
                }

                return redirect()->route('admin.manage-users')->with('success', $message);
            });

        } catch (\Exception $e) {
            Log::error('User Management Store Error: '.$e->getMessage());

            return redirect()->back()->withErrors(['message' => 'Failed to create user. '.$e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $rules = [
            'username' => "sometimes|required|string|max:255|unique:users,username,{$id},user_id",
            'email' => "sometimes|required|email|max:255|unique:users,email,{$id},user_id",
            'company_id' => 'nullable|exists:companies,company_id',
        ];

        if ($user->role === 'Student') {
            $rules['programme_id'] = 'sometimes|required|exists:programmes,programme_id';
            $rules['pb_student_code'] = "sometimes|required|string|max:50|unique:students,pb_student_code,{$user->student?->student_id},student_id";
        }

        $validated = $request->validate($rules);

        try {
            DB::transaction(function () use ($user, $validated, $request) {
                $updateData = [];
                if ($request->has('username')) {
                    $updateData['username'] = $validated['username'];
                }
                if ($request->has('email')) {
                    $updateData['email'] = $validated['email'];
                }
                if ($request->has('company_id')) {
                    $updateData['company_id'] = $validated['company_id'];
                }

                $user->update($updateData);

                if ($user->role === 'Student') {
                    $studentData = [];
                    if ($request->has('programme_id')) {
                        $studentData['programme_id'] = $validated['programme_id'];
                    }
                    if ($request->has('pb_student_code')) {
                        $studentData['pb_student_code'] = $validated['pb_student_code'];
                    }

                    if (! empty($studentData)) {
                        $user->student()->update($studentData);
                    }
                }
            });

            return redirect()->route('admin.manage-users')->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            Log::error('User Update Error: '.$e->getMessage());

            return back()->withErrors(['message' => 'Failed to update user details.']);
        }
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('admin.manage-users')->with('success', 'User deleted.');
    }

    public function unassignCompany($id)
    {
        $user = User::where('role', 'Company')->findOrFail($id);
        $user->update(['company_id' => null]);

        return redirect()->back()->with('success', 'Company unassigned successfully.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls',
        ]);

        DB::transaction(function () use ($request) {
            Excel::import(new StudentsImport, $request->file('file'));
        });

        return redirect()->route('admin.manage-users')->with('success', 'Batch import completed successfully.');
    }
}
