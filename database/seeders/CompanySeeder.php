<?php

namespace Database\Seeders;

use App\Models\Company;
use Database\Seeders\Support\DemoCompanies;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        foreach (DemoCompanies::all() as $example) {
            Company::firstOrCreate(['company_name' => $example['name']], [
                'is_approved' => true,
                'location_type' => $example['district'] === 'Overseas' ? 'International' : 'Local',
                'industry_sector' => $example['sector'],
                'office_address' => $example['address'],
                'district' => $example['district'],
                'description' => 'Demo company providing internship opportunities in '.$example['sector'].'.',
            ]);
        }
    }
}
