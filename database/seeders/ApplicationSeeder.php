<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('applications')->insert([
            // Ahmad (student_id = 1) applications
            [
                'student_id' => 1,
                'quota_id' => 1,
                'apply_date' => now(),
                'app_status' => 'Approved',
                'company_feedback' => 'Interview went well, offered position'
            ],
            [
                'student_id' => 1,
                'quota_id' => 4,
                'apply_date' => now(),
                'app_status' => 'Reviewing',
                'company_feedback' => 'Scheduling interview'
            ],
            // Sarah (student_id = 2) applications
            [
                'student_id' => 2,
                'quota_id' => 1,
                'apply_date' => now(),
                'app_status' => 'Pending',
                'company_feedback' => null
            ],
            [
                'student_id' => 2,
                'quota_id' => 3,
                'apply_date' => now(),
                'app_status' => 'Pending',
                'company_feedback' => null
            ],
            // John (student_id = 3) applications
            [
                'student_id' => 3,
                'quota_id' => 2,
                'apply_date' => now(),
                'app_status' => 'Approved',
                'company_feedback' => 'Offered position'
            ],
            [
                'student_id' => 3,
                'quota_id' => 5,
                'apply_date' => now(),
                'app_status' => 'Reviewing',
                'company_feedback' => 'Second interview scheduled'
            ],
            // Nurul (student_id = 4) applications
            [
                'student_id' => 4,
                'quota_id' => 6,
                'apply_date' => now(),
                'app_status' => 'Approved',
                'company_feedback' => 'Offered internship'
            ],
            [
                'student_id' => 4,
                'quota_id' => 2,
                'apply_date' => now(),
                'app_status' => 'Rejected',
                'company_feedback' => 'Looking for more technical candidates'
            ],
            // Faiz (student_id = 5) applications
            [
                'student_id' => 5,
                'quota_id' => 6,
                'apply_date' => now(),
                'app_status' => 'Pending',
                'company_feedback' => null
            ],
            // Wei Jie (student_id = 6) applications
            [
                'student_id' => 6,
                'quota_id' => 7,
                'apply_date' => now(),
                'app_status' => 'Approved',
                'company_feedback' => 'Offered position'
            ],
            [
                'student_id' => 6,
                'quota_id' => 8,
                'apply_date' => now(),
                'app_status' => 'Pending',
                'company_feedback' => null
            ],
        ]);
    }
}
