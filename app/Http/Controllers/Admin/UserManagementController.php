<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $companies = Company::all(['company_id', 'company_name']);

        // Fetch users with role 'Company' and their linked company
        $companyUsers = User::where('role', 'Company')
            ->with('company')
            ->get();

        // Fetch users with student role
        $students = User::where('role', 'Student')->get();

        return Inertia::render('Admin/ManageUsers', [
            'companies' => $companies,
            'companyUsers' => $companyUsers,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'company_id' => 'required|exists:companies,company_id',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'Company',
        ]);

        // Link user to the selected company
        $company = Company::find($request->company_id);
        $company->user_id = $user->user_id;
        $company->save();

        return redirect()->route('admin.manage-users')->with('success', 'Focal person added.');
    }

    public function edit($id)
    {
        $user = User::where('role', 'Company')->findOrFail($id);
        $companies = Company::all(['company_id', 'company_name']);

        return Inertia::render('Admin/EditUser', [
            'user' => $user,
            'companies' => $companies,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role', 'Company')->findOrFail($id);

        $request->validate([
            'username' => 'required|string|max:255|unique:users,username,'.$user->user_id.',user_id',
            'email' => 'required|email|unique:users,email,'.$user->user_id.',user_id',
            'password' => 'nullable|min:8',
            'company_id' => 'required|exists:companies,company_id',
        ]);

        $user->username = $request->username;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        // Update company link
        $company = Company::find($request->company_id);
        $company->user_id = $user->user_id;
        $company->save();

        return redirect()->route('admin.manage-users')->with('success', 'User updated.');
    }

    public function destroy($id)
    {
        $user = User::where('role', 'Company')->findOrFail($id);
        $user->delete();

        return redirect()->route('admin.manage-users')->with('success', 'User deleted.');
    }
}
