<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlacementQuotaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('placement_quotas')->insert([
            // TechCorp quotas (company_id = 1)
            [
                'company_id' => 1,
                'programme_id' => 2,
                'job_title' => 'Data Analyst Intern',
                'job_description' => 'Work with the data analytics team on business intelligence projects. Experience with SQL and Python preferred.',
                'total_slots' => 3,
                'min_cgpa' => 3.00,
                'quota_status' => 'Approved',
                'is_released' => true,
                'created_at' => now()
            ],
            [
                'company_id' => 1,
                'programme_id' => 1,
                'job_title' => 'Web Developer Intern',
                'job_description' => 'Assist in developing company websites and web applications. React and PHP knowledge required.',
                'total_slots' => 2,
                'min_cgpa' => 2.80,
                'quota_status' => 'Approved',
                'is_released' => true,
                'created_at' => now()
            ],
            [
                'company_id' => 1,
                'programme_id' => 3,
                'job_title' => 'Cybersecurity Intern',
                'job_description' => 'Help monitor security systems and conduct vulnerability assessments.',
                'total_slots' => 2,
                'min_cgpa' => 2.20,
                'quota_status' => 'Pending',
                'is_released' => false,
                'created_at' => now()
            ],
            // GlobalTech quotas (company_id = 2)
            [
                'company_id' => 2,
                'programme_id' => 2,
                'job_title' => 'Junior Data Scientist',
                'job_description' => 'Work on machine learning projects and data visualization.',
                'total_slots' => 4,
                'min_cgpa' => 2.00,
                'quota_status' => 'Approved',
                'is_released' => true,
                'created_at' => now()
            ],
            [
                'company_id' => 2,
                'programme_id' => 1,
                'job_title' => 'Frontend Developer Intern',
                'job_description' => 'Build responsive user interfaces using React and Tailwind CSS.',
                'total_slots' => 3,
                'min_cgpa' => 3.00,
                'quota_status' => 'Approved',
                'is_released' => true,
                'created_at' => now()
            ],
            // DataTech quotas (company_id = 3)
            [
                'company_id' => 3,
                'programme_id' => 2,
                'job_title' => 'Business Intelligence Intern',
                'job_description' => 'Create dashboards and reports using Power BI and Tableau.',
                'total_slots' => 2,
                'min_cgpa' => 2.20,
                'quota_status' => 'Approved',
                'is_released' => true,
                'created_at' => now()
            ],
            // BSP quotas (company_id = 4)
            [
                'company_id' => 4,
                'programme_id' => 9,
                'job_title' => 'Mechanical Engineering Intern',
                'job_description' => 'Assist in maintenance planning and project documentation.',
                'total_slots' => 5,
                'min_cgpa' => 3.00,
                'quota_status' => 'Approved',
                'is_released' => true,
                'created_at' => now()
            ],
            [
                'company_id' => 4,
                'programme_id' => 10,
                'job_title' => 'Electrical Engineering Intern',
                'job_description' => 'Support electrical systems monitoring and troubleshooting.',
                'total_slots' => 3,
                'min_cgpa' => 3.00,
                'quota_status' => 'Pending',
                'is_released' => false,
                'created_at' => now()
            ],
            [
                'company_id' => 4,
                'programme_id' => 12,
                'job_title' => 'Petroleum Engineering Intern',
                'job_description' => 'Learn about oil and gas production processes.',
                'total_slots' => 2,
                'min_cgpa' => 2.00,
                'quota_status' => 'Approved',
                'is_released' => true,
                'created_at' => now()
            ],
        ]);
    }
}
