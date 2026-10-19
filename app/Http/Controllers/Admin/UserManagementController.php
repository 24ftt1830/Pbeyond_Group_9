<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminRecordChange;
use App\Models\AcademicSemester;
use App\Models\Company;
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
            'academicSemesters' => AcademicSemester::orderBy('starts_on')->get(['id', 'name', 'starts_on', 'ends_on']),
            'companyUsers' => User::where('role', 'Company')
                ->with('company')
                ->get(),
            'students' => User::where('role', 'Student')
                ->with('student.programme', 'student.intakeSemester')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:Student,Company',
        ];

        if ($request->input('role') === 'Company') {
            $rules['company_id'] = [
                'required',
                'exists:companies,company_id',
                Rule::unique('users', 'company_id')->where(fn ($query) => $query->where('role', 'Company')),
            ];
        } else {
            $rules['programme_id'] = 'required|exists:programmes,programme_id';
            $rules['pb_student_code'] = 'required|string|max:50|unique:students,pb_student_code';
            $rules['intake_semester_id'] = 'required|exists:academic_semesters,id';
        }

        $validated = $request->validate($rules, [
            'company_id.unique' => 'This company already has an HR account. Edit the existing account instead.',
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $userData = [
                    'username' => $validated['username'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => $validated['role'],
                ];

                if ($validated['role'] === 'Company') {
                    $userData['company_id'] = $validated['company_id'];
                }

                $user = User::create($userData);

                if ($validated['role'] === 'Student') {
                    $intakeSemester = AcademicSemester::findOrFail($validated['intake_semester_id']);
                    $user->student()->create([
                        'pb_student_code' => $validated['pb_student_code'],
                        'programme_id' => $validated['programme_id'],
                        'intake_semester_id' => $intakeSemester->id,
                        'intake_session' => $intakeSemester->name,
                        'full_name' => $validated['username'],
                        'cgpa' => 0.0,
                    ]);

                    return redirect()->route('admin.manage-users')->with('success', 'Student account created successfully.');
                }

                AdminRecordChange::record($request->user(), $user, 'Created company HR account');

                return redirect()->route('admin.manage-users')->with('success', 'Company HR account created successfully.');
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
            $rules['intake_semester_id'] = 'sometimes|required|exists:academic_semesters,id';
        } else {
            $rules['company_id'] = [
                'sometimes',
                'required',
                'exists:companies,company_id',
                Rule::unique('users', 'company_id')
                    ->where(fn ($query) => $query->where('role', 'Company'))
                    ->ignore($id, 'user_id'),
            ];
        }

        $validated = $request->validate($rules, [
            'company_id.unique' => 'This company already has an HR account. Choose a company without an HR account.',
            'company_id.required' => 'The HR account must remain linked to its company.',
        ]);

        if ($user->role === 'Student'
            && isset($validated['intake_semester_id'])
            && (int) $validated['intake_semester_id'] !== (int) $user->student?->intake_semester_id
            && $user->student?->applications()->exists()) {
            throw ValidationException::withMessages([
                'intake_semester_id' => 'A student’s intake cannot be changed after they have submitted an internship application.',
            ]);
        }

        $companyChanged = $user->role === 'Company'
            && (int) ($validated['company_id'] ?? $user->company_id) !== (int) $user->company_id;

        try {
            DB::transaction(function () use ($user, $validated, $request, $companyChanged) {
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

                if ($user->role === 'Company' && $companyChanged) {
                    $companyIds = collect([$user->company_id, $validated['company_id']])
                        ->filter()
                        ->unique()
                        ->sort()
                        ->values();
                    Company::whereIn('company_id', $companyIds)
                        ->orderBy('company_id')
                        ->lockForUpdate()
                        ->get();

                    $targetHasAnotherHr = User::query()
                        ->where('role', 'Company')
                        ->where('company_id', $validated['company_id'])
                        ->where('user_id', '<>', $user->user_id)
                        ->exists();

                    if ($targetHasAnotherHr) {
                        throw ValidationException::withMessages([
                            'company_id' => 'This company already has an HR account. Choose another company.',
                        ]);
                    }

                    $updateData['company_id'] = $validated['company_id'];
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
                    if ($request->has('intake_semester_id')) {
                        $intakeSemester = AcademicSemester::findOrFail($validated['intake_semester_id']);
                        $studentData['intake_semester_id'] = $intakeSemester->id;
                        $studentData['intake_session'] = $intakeSemester->name;
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
            if ($e instanceof ValidationException) {
                throw $e;
            }
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
        $validated = $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls',
            'intake_semester_id' => 'required|exists:academic_semesters,id',
        ]);

        DB::transaction(function () use ($request, $validated) {
            Excel::import(new StudentsImport((int) $validated['intake_semester_id']), $request->file('file'));
        });

        return redirect()->route('admin.manage-users')->with('success', 'Batch import completed successfully.');
    }
}
