<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\PlacementQuota;
use App\Models\AcademicSemester;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /** Display companies with approved, released quotas available to all students. */
    public function index()
    {
        $student = Auth::user()->student;
        $internshipSemesterId = AcademicSemester::internshipTermIdForIntake((int) $student?->intake_semester_id);

        $companies = Company::whereHas(
            'placementQuotas',
            fn ($query) => $query->available()->where('academic_semester_id', $internshipSemesterId ?? 0)
        )
        ->with([
            'branches',
            'placementQuotas.programmes.school',
            'placementQuotas' => fn ($query) => $query->available()->where('academic_semester_id', $internshipSemesterId ?? 0),
        ])
        ->get();

        $companiesData = $companies->map(function ($company) {
            $available = $company->placementQuotas
                ->sum(fn ($q) => $q->remaining_slots);

            return [
                'company_id'      => $company->company_id,
                'company_name'    => $company->company_name,
                'available'       => (int) $available,
                'industry_sector' => $company->industry_sector ?? 'General',
                'office_address'  => $company->office_address ?? 'Brunei Muara',
                'district' => $company->district,
                'branches' => $company->branches,
                'schools' => $company->placementQuotas->flatMap(fn ($quota) => $quota->programmes->map(fn ($programme) => $programme->school?->school_name))->filter()->unique()->values(),
            ];
        });

        return Inertia::render('Student/Companies', [
            'companies' => $companiesData,
            'hasAssignedIntake' => $internshipSemesterId !== null,
        ]);
    }

    /** Display all approved, released positions for a company. */
    public function show($id)
    {
        $student = Auth::user()->student;
        $company = Company::findOrFail($id);
        $internshipSemesterId = AcademicSemester::internshipTermIdForIntake((int) $student?->intake_semester_id);

        $quotas = PlacementQuota::available()
            ->where('company_id', $id)
            ->where('academic_semester_id', $internshipSemesterId ?? 0)
            ->with(['programmes.school', 'branches'])
            ->withCount(['applications as recruited_count' => fn ($query) => $query->whereIn('app_status', ['Recruited', 'Approved'])])
            ->get();
        $quotas->each(fn ($quota) => $quota->setAttribute('remaining_slots', max(0, $quota->total_slots - $quota->recruited_count)));

        // Query primary key 'id' and 'quota_id' explicitly
        $applications = $student->applications()
            ->active()->get(['id', 'quota_id', 'app_status', 'company_branch_id'])
            ->map(fn ($app) => [
                'application_id' => (int) $app->id,
                'quota_id'       => (int) $app->quota_id,
                'app_status' => $app->app_status,
                'company_branch_id' => $app->company_branch_id,
            ]);

        return Inertia::render('Student/ViewCompany', [
            'company'      => $company,
            'quotas'       => $quotas,
            'applications' => $applications,
        ]);
    }

    /**
     * Handle application submission for a quota position.
     */
    public function apply(Request $request, $companyId)
    {
        $student = Auth::user()->student;

        if (!$student || !$student->isProfileComplete()) {
            return back()->withErrors([
                'message' => 'Complete and save all required profile information before applying for a position.',
            ]);
        }

        $internshipSemesterId = AcademicSemester::internshipTermIdForIntake((int) $student->intake_semester_id);
        if (!$internshipSemesterId) {
            return back()->withErrors([
                'message' => 'Your intake semester is not assigned or does not yet have an internship term.',
            ]);
        }

        if (empty($student->cv_generated_at) || empty($student->cv_snapshot)) {
            return back()->withErrors([
                'message' => 'Generate your CV from your profile before applying for a position.',
            ]);
        }

        $data = $request->validate([
            'quota_id' => [
                'required',
                'exists:placement_quotas,quota_id',
            ],
            'company_branch_id' => ['required', 'integer', 'exists:company_branches,id'],
        ]);
        DB::transaction(function () use ($student, $data, $companyId, $internshipSemesterId) {
            Student::whereKey($student->getKey())->lockForUpdate()->firstOrFail();
            if ($student->applications()->active()->exists()) {
                throw ValidationException::withMessages(['message' => 'You can have only one active application. Wait for a decision or cancel your pending application before applying again.']);
            }
            $quota = PlacementQuota::available()->whereKey($data['quota_id'])
                ->where('company_id', $companyId)->where('academic_semester_id', $internshipSemesterId)
                ->lockForUpdate()->first();
            if (!$quota || $quota->remaining_slots <= 0) {
                throw ValidationException::withMessages(['message' => 'This position is no longer available or has no remaining slots.']);
            }
            if (!$quota->branches()->where('company_branches.company_id', $companyId)->where('company_branches.id', $data['company_branch_id'])->exists()) {
                throw ValidationException::withMessages(['company_branch_id' => 'Choose a branch offered for this position.']);
            }
            $application = Application::create([
                'student_id' => $student->student_id, 'quota_id' => $quota->quota_id,
                'company_branch_id' => $data['company_branch_id'], 'app_status' => 'Pending', 'apply_date' => now(),
            ]);
            $application->statusHistories()->create(['from_status' => null, 'to_status' => 'Pending', 'changed_by_user_id' => auth()->id()]);
        });

        return back()->with(
            'success',
            'Application submitted!'
        );
    }

    /**
     * Cancel/delete a pending application submitted by the student.
     */
    public function cancel($application)
    {
        $student = Auth::user()->student;

        $applicationId = $application instanceof Application ? $application->id : $application;

        $appRecord = $student->applications()
            ->where('id', $applicationId)
            ->first();

        if (!$appRecord) {
            return back()->withErrors([
                'message' => 'Application not found or unauthorized action.',
            ]);
        }

        if ($appRecord->app_status !== 'Pending') {
            return back()->withErrors([
                'message' => 'You can only cancel applications that are pending review.',
            ]);
        }

        DB::transaction(function () use ($student, $applicationId) {
            Student::whereKey($student->getKey())->lockForUpdate()->firstOrFail();
            $record = $student->applications()->whereKey($applicationId)->lockForUpdate()->firstOrFail();
            if ($record->app_status !== 'Pending') {
                throw ValidationException::withMessages(['message' => 'You can only cancel applications that are pending review.']);
            }
            $record->update(['app_status' => 'Cancelled']);
            $record->statusHistories()->create(['from_status' => 'Pending', 'to_status' => 'Cancelled', 'changed_by_user_id' => auth()->id()]);
        });

        return back()->with(
            'success',
            'Application cancelled successfully!'
        );
    }
}
