<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\PlacementQuota;
use App\Models\Programme;
use Database\Seeders\Support\DemoAcademicContext;
use Database\Seeders\Support\DemoCompanies;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlacementQuotaSeeder extends Seeder
{
    public function run(): void
    {
        $terms = DemoAcademicContext::terms();
        foreach (DemoCompanies::all() as $example) {
            $company = Company::where('company_name', $example['name'])->firstOrFail();
            $eligible = Programme::whereHas('school', fn ($query) => $query->where('school_code', $example['school']))
                ->orderBy('class_id')->limit(5)->pluck('programme_id');
            if ($eligible->count() < 3) {
                throw new \RuntimeException('Seed at least three eligible programmes for '.$example['school'].'.');
            }

            // Three positions in the first available term and a planning example in the next.
            foreach ($terms->take(2) as $termIndex => $term) {
                $jobs = $termIndex === 0 ? $example['jobs'] : array_slice($example['jobs'], 0, 1);
                foreach ($jobs as $jobIndex => $job) {
                    DB::transaction(function () use ($company, $eligible, $job, $jobIndex, $term) {
                        $primaryId = Programme::where('programme_name', 'Level 5 Diploma in '.$job['programme'])->firstOrFail()->programme_id;
                        $quota = PlacementQuota::firstOrCreate([
                            'company_id' => $company->company_id,
                            'academic_semester_id' => $term->id,
                            'job_title' => $job['title'],
                        ], [
                            'programme_id' => $primaryId,
                            'job_description' => 'Gain supervised practical experience as a '.$job['title'].'. Support daily tasks, keep clear records, and develop professional skills.',
                            'skills' => $job['skills'],
                            'total_slots' => 2,
                            'min_cgpa' => 2.00,
                            'interview_required' => $jobIndex === 1,
                            'quota_status' => 'Pending',
                            'is_released' => false,
                        ]);
                        // A repeated seed never resets decisions or changes an existing position.
                        if ($quota->wasRecentlyCreated) {
                            $quota->programmes()->sync($eligible->all());
                            $quota->branches()->sync($company->branches()->pluck('id')->all());
                        }
                    });
                }
            }
        }
    }
}
