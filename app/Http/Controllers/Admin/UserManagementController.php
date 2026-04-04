<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Models\Programme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ManageUsers', [
            'companies' => Company::all(['company_id', 'company_name']),
            'programmes' => \App\Models\Programme::all(['programme_id', 'programme_name']),
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
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:Company,Student',
        ];

        if ($request->role === 'Company') {
            $rules['company_id'] = 'required|exists:companies,company_id';
        } else {
            $rules['programme_id'] = 'required|exists:programmes,programme_id';
        }

        $validated = $request->validate($rules);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $user = User::create([
                    'username' => $validated['username'],
                    'email'    => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role'     => $validated['role'],
                ]);

                if ($user->role === 'Company') {
                    $company = Company::find($validated['company_id']);
                    $company->user_id = $user->user_id;
                    $company->save();
                    
                    $message = 'Focal person created and linked to company.';
                } else {
                    $user->student()->create([
                        'programme_id' => $validated['programme_id'],
                        'cgpa'         => 0.0, 
                    ]);
                    $message = 'Student account created successfully.';
                }

                return redirect()->route('admin.manage-users')->with('success', $message);
            });

        } catch (\Exception $e) {
            Log::error("User Management Store Error: " . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to create user.']);
        }
    }

    public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $rules = [
        'username' => "required|string|max:255|unique:users,username,{$id},user_id",
        'email'    => "required|email|max:255|unique:users,email,{$id},user_id",
    ];

    if ($user->role === 'Student') {
        $rules['programme_id'] = 'required|exists:programmes,programme_id';
        $rules['interview_required'] = 'boolean';
    }

    $validated = $request->validate($rules);

    try {
        DB::transaction(function () use ($user, $validated, $request) {
            $user->update([
                'username' => $validated['username'],
                'email'    => $validated['email'],
            ]);

            if ($user->role === 'Student') {
                $user->student()->update([
                    'programme_id' => $validated['programme_id'],
                    'interview_required' => $request->boolean('interview_required'),
                ]);
            }            
        });

        return redirect()->route('admin.manage-users')->with('success', 'User updated successfully.');

    } catch (\Exception $e) {
        Log::error("User Update Error: " . $e->getMessage());
        return back()->withErrors(['message' => 'Failed to update user details.']);
    }
}

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'Company') {
            Company::where('user_id', $user->user_id)->update(['user_id' => null]);
        }

        $user->delete();

        return redirect()->route('admin.manage-users')->with('success', 'User deleted.');
    }

    public function unassignCompany($id)
    {
        $user = User::where('role', 'Company')->findOrFail($id);

        // setting the user_id to null in companies table
        \App\Models\Company::where('user_id', $user->user_id)->update(['user_id' => null]);

        return redirect()->back()->with('success', 'Company unassigned successfully.');

    }
}