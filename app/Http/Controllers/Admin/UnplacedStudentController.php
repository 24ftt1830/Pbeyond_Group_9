<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyBranch;
use App\Models\School;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnplacedStudentController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'school_id' => ['nullable', 'integer', 'exists:schools,school_id'],
            'district' => ['nullable', 'string', 'max:40'],
        ]);
        $students = Student::query()->whereDoesntHave('applications', fn ($query) => $query->whereIn('app_status', ['Recruited', 'Approved']))
            ->with(['programme.school', 'applications.quota.company', 'applications.branch', 'applications.statusHistories'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($query) => $query->where('full_name', 'like', "%$search%")->orWhere('pb_student_code', 'like', "%$search%")))
            ->when($filters['school_id'] ?? null, fn ($query, $id) => $query->whereHas('programme', fn ($query) => $query->where('school_id', $id)))
            ->when($filters['district'] ?? null, fn ($query, $district) => $query->where('district', $district))
            ->orderBy('full_name')->paginate(20)->withQueryString()
            ->through(fn ($student) => [
                'student_id' => $student->student_id, 'full_name' => $student->full_name,
                'pb_student_code' => $student->pb_student_code, 'district' => $student->district,
                'programme' => $student->programme?->programme_name,
                'school' => $student->programme?->school?->school_name,
                'active_application' => $student->applications->first(fn ($application) => in_array($application->app_status, \App\Models\Application::ACTIVE_STATUSES, true))?->app_status,
                'rejections' => $student->applications->flatMap(function ($application) {
                    return $application->statusHistories->whereIn('to_status', ['Declined', 'Rejected'])->map(fn ($history) => [
                        'id' => $history->id, 'company' => $application->quota?->company?->company_name ?? 'Company unavailable',
                        'position' => $application->quota?->job_title, 'branch' => $application->branch?->name,
                        'rejected_at' => $history->created_at?->toIso8601String(),
                        'legacy_record' => $history->from_status === null,
                    ]);
                })->sortByDesc('rejected_at')->values(),
            ]);

        return Inertia::render('Admin/UnplacedStudents', [
            'students' => $students, 'filters' => $filters,
            'schools' => School::orderBy('school_name')->get(['school_id', 'school_name', 'school_code']),
            'districts' => CompanyBranch::DISTRICTS,
        ]);
    }
}
