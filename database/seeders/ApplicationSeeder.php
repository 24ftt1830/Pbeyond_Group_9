<?php

namespace Database\Seeders;

use App\Models\Application;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $examples = [
            [
                'company' => 'TechCorp Brunei',
                'job_title' => 'Data Analyst Intern',
                'student_code' => '24FTT003',
                'status' => 'Pending',
            ],
            [
                'company' => 'TechCorp Brunei',
                'job_title' => 'Web Developer Intern',
                'student_code' => '24FTT001',
                'status' => 'Pending',
            ],
            [
                'company' => 'GlobalTech Solutions',
                'job_title' => 'Frontend Developer Intern',
                'student_code' => '24FTT001',
                'status' => 'Pending',
            ],
            [
                'company' => 'GlobalTech Solutions',
                'job_title' => 'Junior Data Scientist',
                'student_code' => '24FTT003',
                'status' => 'Pending',
            ],
        ];

        foreach ($examples as $example) {
            $companyId = DB::table('companies')->where('company_name', $example['company'])->value('company_id');
            $quotaId = DB::table('placement_quotas')
                ->where('company_id', $companyId)
                ->where('job_title', $example['job_title'])
                ->where('quota_status', 'Approved')
                ->where('is_released', true)
                ->value('quota_id');
            $studentId = DB::table('students')->where('pb_student_code', $example['student_code'])->value('student_id');
            if (!$companyId || !$quotaId || !$studentId) {
                continue;
            }

            Application::updateOrCreate(
                ['student_id' => $studentId, 'quota_id' => $quotaId],
                ['app_status' => $example['status']]
            );
        }
    }
}
