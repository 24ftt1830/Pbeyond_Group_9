<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminRecordChange;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Imports\StudentsImport;
use Maatwebsite\Excel\Facades\Excel;

class UserManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ManageUsers', [
            ...app(SupervisorManagementController::class)->accounts(),
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
            'role' => 'required|in:Student',
            'programme_id' => 'required|exists:programmes,programme_id',
            'pb_student_code' => 'required|string|max:50|unique:students,pb_student_code',
        ];

        $validated = $request->validate($rules, [
            'role.in' => 'HR accounts are created with Add Company. Manage Users only creates student accounts.',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $userData = [
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'Student',
                ];

                $user = User::create($userData);

                $user->student()->create([
                    'pb_student_code' => $validated['pb_student_code'],
                    'programme_id' => $validated['programme_id'],
                    'full_name' => $validated['username'],
                    'cgpa' => 0.0,
                ]);

                return redirect()->route('admin.manage-users')->with('success', 'Student account created successfully.');
            });

        } catch (\Exception $e) {
            Log::error('User Management Store Error: '.$e->getMessage());

            return redirect()->back()->withErrors(['message' => 'Failed to create user. '.$e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        abort_unless(in_array($user->role, ['Student', 'Company'], true), 404);
        $rules = [
            'username' => "sometimes|required|string|max:255|unique:users,username,{$id},user_id",
            'email' => "sometimes|required|email|max:255|unique:users,email,{$id},user_id",
            'password' => 'nullable|string|min:8',
            'company_id' => 'nullable|exists:companies,company_id',
        ];

        if ($user->role === 'Student') {
            $rules['full_name'] = 'sometimes|required|string|max:255';
            $rules['programme_id'] = 'sometimes|required|exists:programmes,programme_id';
            $rules['pb_student_code'] = "sometimes|required|string|max:50|unique:students,pb_student_code,{$user->student?->student_id},student_id";
        } else {
            $rules['company_id'] = [
                'sometimes', $user->company_id === null ? 'nullable' : 'required',
                Rule::in([$user->company_id]),
            ];
        }

        $validated = $request->validate($rules, [
            'company_id.in' => 'The HR account stays linked to its existing company. Edit its login details instead.',
            'company_id.required' => 'The HR account must remain linked to its company.',
        ]);

        try {
            DB::transaction(function () use ($user, $validated, $request) {
                $before = $user->toArray();
                $updateData = [];
                if (!empty($validated['password'])) {
                    $updateData['password'] = Hash::make($validated['password']);
                }
                if ($request->has('username')) {
                    $updateData['username'] = $validated['username'];
                }
                if ($request->has('email')) {
                    $updateData['email'] = $validated['email'];
                }
                $user->update($updateData);

                if ($user->role === 'Student') {
                    $studentData = [];
                    if ($request->has('full_name')) {
                        $studentData['full_name'] = $validated['full_name'];
                    }
                    if ($request->has('programme_id')) {
                        $studentData['programme_id'] = $validated['programme_id'];
                    }
                    if ($request->has('pb_student_code')) {
                        $studentData['pb_student_code'] = $validated['pb_student_code'];
                    }

                    if (! empty($studentData)) {
                        $assignmentChanged = collect($studentData)->only(['programme_id', 'pb_student_code'])
                            ->contains(fn ($value, $field) => (string) $user->student?->{$field} !== (string) $value);
                        if ($assignmentChanged) {
                            $user->student?->internshipCompletion?->resetAcademicDecision();
                        }
                        $user->student()->update($studentData);
                    }
                }
                AdminRecordChange::record($request->user(), $user, 'Updated user account', $before);
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
        abort_unless(in_array($user->role, ['Student', 'Company'], true), 404);
        if ($user->role === 'Company') {
            throw ValidationException::withMessages([
                'account' => 'Each company keeps one HR account. Update the existing login details instead of deleting it.',
            ]);
        }
        $user->delete();

        return redirect()->route('admin.manage-users')->with('success', 'User deleted.');
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
