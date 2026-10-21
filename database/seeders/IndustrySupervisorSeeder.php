<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoCompanies;
use Illuminate\Database\Seeder;

class IndustrySupervisorSeeder extends Seeder
{
    /** Examples only. HR creates the actual supervisor account and assigns individual students. */
    public static function referenceData(): array
    {
        return array_map(fn ($company) => [
            'company_name' => $company['name'],
            'full_name' => $company['sector'].' Supervisor',
            'email' => str_replace('hr@', 'supervisor@', $company['hr']['email']),
            'position' => 'Industry Supervisor',
        ], DemoCompanies::all());
    }

    public function run(): void
    {
        // Intentionally empty: creating accounts and choosing students is part of the HR demo.
    }
}
