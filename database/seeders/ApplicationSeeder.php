<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\AcademicSemester;
use App\Models\Student;
use App\Models\PlacementQuota;
use Illuminate\Database\Seeder;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        // Optional only: no applications are created by the default DatabaseSeeder.
        $examples = [
            ['company' => 'TechCorp Brunei', 'job_title' => 'Web Developer Intern', 'student_code' => '24FTT001'],
            ['company' => 'GlobalTech Solutions', 'job_title' => 'Junior Software Developer Intern', 'student_code' => '24FTT002'],
            ['company' => 'DataTech Analytics', 'job_title' => 'Reporting Analyst Intern', 'student_code' => '24FTT003'],
            ['company' => 'Brunei Business Services', 'job_title' => 'Accounting Intern', 'student_code' => '24FTB001'],
            ['company' => 'Brunei Business Services', 'job_title' => 'HR Administration Intern', 'student_code' => '24FTB002'],
            ['company' => 'Brunei Shell Petroleum', 'job_title' => 'Mechanical Engineering Intern', 'student_code' => '24FTE001'],
            ['company' => 'CarePlus Health Services', 'job_title' => 'Nursing Intern', 'student_code' => '24FTH001'],
        ];

        foreach ($examples as $example) {
            $student = Student::where('pb_student_code', $example['student_code'])->first();
            if (!$student || !$student->isProfileComplete() || !$student->cv_snapshot || !$student->cv_generated_at) continue;
            if ($student->applications()->active()->exists()) continue;
            $termId = AcademicSemester::internshipTermIdForIntake((int) $student->intake_semester_id);
            $quota = PlacementQuota::available()->where('job_title', $example['job_title'])
                ->where('academic_semester_id', $termId)
                ->whereHas('company', fn ($query) => $query->where('company_name', $example['company']))
                ->whereHas('programmes', fn ($query) => $query->where('programmes.programme_id', $student->programme_id))
                ->first();
            if (!$quota || $quota->remaining_slots < 1) continue;
            $branchId = $quota->branches()->value('company_branches.id');
            if (!$branchId) continue;
            $studentId = $student->student_id;
            $quotaId = $quota->quota_id;
            $application = Application::create([
                'student_id' => $studentId, 'quota_id' => $quotaId,
                'company_branch_id' => $branchId, 'app_status' => 'Pending',
            ]);
            $application->statusHistories()->create(['from_status' => null, 'to_status' => 'Pending']);
        }
    }
}
