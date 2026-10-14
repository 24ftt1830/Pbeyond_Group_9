<?php

namespace Database\Seeders;

use App\Models\PlacementQuota;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlacementQuotaSeeder extends Seeder
{
    public function run(): void
    {
        $examples = [
            [
                'company' => 'TechCorp Brunei',
                'programme' => 'Level 5 Diploma in Data Analytics',
                'job_title' => 'Data Analyst Intern',
                'job_description' => 'Assist with data cleaning, reporting, and business intelligence tasks.',
                'skills' => ['SQL', 'Data analysis', 'Excel'],
                'total_slots' => 2,
                'min_cgpa' => 2.00,
            ],
            [
                'company' => 'TechCorp Brunei',
                'programme' => 'Level 5 Diploma in Web Technology',
                'job_title' => 'Web Developer Intern',
                'job_description' => 'Support the development and maintenance of company web applications.',
                'skills' => ['PHP', 'JavaScript', 'Web development'],
                'total_slots' => 2,
                'min_cgpa' => 2.00,
            ],
            [
                'company' => 'TechCorp Brunei',
                'programme' => 'Level 5 Diploma in Application Development',
                'job_title' => 'Application Developer Intern',
                'job_description' => 'Support the design, development, testing, and documentation of business applications.',
                'skills' => ['Java', 'Database design', 'Git'],
                'total_slots' => 2,
                'min_cgpa' => 2.00,
            ],
            [
                'company' => 'GlobalTech Solutions',
                'programme' => 'Level 5 Diploma in Web Technology',
                'job_title' => 'Frontend Developer Intern',
                'job_description' => 'Build and maintain responsive user interfaces for web applications.',
                'skills' => ['JavaScript', 'React', 'CSS'],
                'total_slots' => 2,
                'min_cgpa' => 2.00,
            ],
            [
                'company' => 'GlobalTech Solutions',
                'programme' => 'Level 5 Diploma in Application Development',
                'job_title' => 'Junior Software Developer Intern',
                'job_description' => 'Help build and test software features and maintain application documentation.',
                'skills' => ['Application development', 'Problem solving', 'Teamwork'],
                'total_slots' => 2,
                'min_cgpa' => 2.00,
            ],
            [
                'company' => 'GlobalTech Solutions',
                'programme' => 'Level 5 Diploma in Data Analytics',
                'job_title' => 'Junior Data Scientist',
                'job_description' => 'Support data exploration, visualization, and introductory machine learning work.',
                'skills' => ['Python', 'Data visualization', 'Statistics'],
                'total_slots' => 2,
                'min_cgpa' => 2.00,
            ],
        ];

        foreach ($examples as $example) {
            $companyId = DB::table('companies')->where('company_name', $example['company'])->value('company_id');
            $programmeId = DB::table('programmes')->where('programme_name', $example['programme'])->value('programme_id');
            if (!$companyId || !$programmeId) {
                continue;
            }

            $quota = PlacementQuota::firstOrNew([
                'company_id' => $companyId,
                'job_title' => $example['job_title'],
            ]);
            $isNewQuota = !$quota->exists;
            $quota->fill([
                'programme_id' => $programmeId,
                'job_description' => $example['job_description'],
                'skills' => $example['skills'],
                'total_slots' => $example['total_slots'],
                'min_cgpa' => $example['min_cgpa'],
                'interview_required' => false,
            ]);

            // New sample requests wait for Admin review. Preserve decisions already
            // made on existing quotas when this seeder is run again.
            if ($isNewQuota) {
                $quota->quota_status = 'Pending';
                $quota->is_released = false;
            }

            if ($isNewQuota || !$quota->academic_semester_id) {
                $quota->academic_semester_id = DB::table('academic_semesters')
                    ->whereDate('starts_on', '<=', now()->toDateString())
                    ->whereDate('ends_on', '>=', now()->toDateString())
                    ->value('id');
            }

            $quota->save();

            $quota->programmes()->syncWithoutDetaching([$programmeId]);
        }
    }
}
