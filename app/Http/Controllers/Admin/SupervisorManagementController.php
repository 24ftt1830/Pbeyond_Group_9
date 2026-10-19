<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSupervisor;
use App\Models\AdminRecordChange;
use App\Models\Company;
use App\Models\IndustrySupervisor;
use App\Models\PlacementQuota;
use App\Models\Student;
use App\Models\User;
use App\Services\IndustrySupervisorAssignments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SupervisorManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Supervisors', $this->accounts());
    }

    public function accounts(): array
    {
        $academic = AcademicSupervisor::with('user')->orderBy('full_name')->get()->map(fn ($record) => $this->row($record, 'academic'));
        $industry = IndustrySupervisor::with(['user', 'assignments'])->orderBy('full_name')->get()->map(fn ($record) => $this->row($record, 'industry'));
        return [
            'supervisors' => $academic->concat($industry)->values(),
            'companies' => Company::orderBy('company_name')->get(['company_id', 'company_name']),
            'quotas' => PlacementQuota::orderBy('job_title')->get(['quota_id', 'company_id', 'job_title', 'quota_status', 'is_released']),
            'assignmentStudents' => Student::whereHas('applications', fn ($query) => $query->where('app_status', 'Recruited'))
                ->with(['applications' => fn ($query) => $query->where('app_status', 'Recruited')->with('quota:quota_id,company_id'), 'supervisorAssignments'])
                ->orderBy('full_name')->get()->map(fn ($student) => [
                    'student_id' => $student->student_id, 'full_name' => $student->full_name,
                    'pb_student_code' => $student->pb_student_code,
                    'company_id' => $student->applications->first()?->quota?->company_id,
                    'supervisor_id' => $student->supervisorAssignments->first()?->supervisor_id,
                ]),
        ];
    }

    private function row($record, string $type): array
    {
        return [
            'id' => $record->getKey(), 'type' => $type, 'user_id' => $record->user_id,
            'username' => $record->user?->username ?? '', 'email' => $record->user?->email ?? $record->email ?? '',
            'full_name' => $record->full_name, 'phone' => $record->phone ?? '',
            'company_id' => $record->company_id ?? '', 'quota_id' => $record->quota_id ?? '',
            'position' => $record->position ?? '',
            'student_ids' => $type === 'industry' ? $record->assignments->pluck('student_id')->values() : [],
        ];
    }

    private function validated(Request $request, string $type, $record = null): array
    {
        $user = $record?->user;
        $data = $request->validate([
            'username' => ['required', 'string', 'max:100', Rule::unique('users', 'username')->ignore($user?->user_id, 'user_id')],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user?->user_id, 'user_id')],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
            'full_name' => ['required', 'string', $type === 'industry' ? 'max:150' : 'max:255'],
            'phone' => ['nullable', 'string', $type === 'industry' ? 'max:20' : 'max:255'],
            'position' => ['nullable', 'string', 'max:100'],
            'company_id' => [$type === 'industry' ? 'required' : 'nullable', 'exists:companies,company_id'],
            'student_ids' => [$type === 'industry' ? 'present' : 'nullable', 'array'],
            'student_ids.*' => ['required', 'integer', 'distinct', 'exists:students,student_id'],
        ]);
        if ($type === 'academic') {
            $data['company_id'] = null;
            $data['quota_id'] = null;
        }
        return $data;
    }

    public function store(Request $request)
    {
        $type = $request->validate(['type' => ['required', 'in:academic,industry']])['type'];
        $data = $this->validated($request, $type);
        $this->save($request, $type, $data);
        return back()->with('success', 'Supervisor account created.');
    }

    public function update(Request $request, string $type, int $id)
    {
        abort_unless(in_array($type, ['academic', 'industry'], true), 404);
        $record = $type === 'academic' ? AcademicSupervisor::findOrFail($id) : IndustrySupervisor::findOrFail($id);
        $data = $this->validated($request, $type, $record);
        $this->save($request, $type, $data, $record);
        return back()->with('success', 'Supervisor account and assignment updated.');
    }

    private function save(Request $request, string $type, array $data, $record = null): void
    {
        DB::transaction(function () use ($request, $type, $data, $record) {
            $record ??= $type === 'academic' ? new AcademicSupervisor() : new IndustrySupervisor();
            $before = $record->exists ? $record->toArray() : null;
            $user = $record->user ?? new User();
            $beforeUser = $user->exists ? $user->toArray() : null;
            $user->fill([
                'username' => $data['username'], 'email' => $data['email'],
                'role' => $type === 'academic' ? 'Academic Supervisor' : 'Industry Supervisor',
                'company_id' => $data['company_id'] ?? null,
            ]);
            if (!empty($data['password'])) {
                $user->password = Hash::make($data['password']);
            }
            $user->save();
            $record->fill([
                'user_id' => $user->user_id, 'full_name' => $data['full_name'],
                'email' => $data['email'], 'phone' => $data['phone'] ?? null,
            ]);
            if ($type === 'industry') {
                $record->fill(['company_id' => $data['company_id'], 'quota_id' => null, 'position' => $data['position'] ?? null]);
            }
            $record->save();
            if ($type === 'industry') {
                app(IndustrySupervisorAssignments::class)->sync($record, $data['student_ids'] ?? [], $request->user());
            }
            AdminRecordChange::record($request->user(), $user, 'Updated supervisor login', $beforeUser);
            AdminRecordChange::record($request->user(), $record, 'Updated supervisor profile and assignment', $before);
        });
    }
}
