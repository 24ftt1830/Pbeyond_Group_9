<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanyBranchSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Company::with('placementQuotas')->get() as $company) {
            $district = $company->location_type === 'International' || $company->location_type === 'Overseas'
                ? 'Overseas' : (stripos($company->office_address ?? '', 'Belait') !== false ? 'Belait' : 'Brunei-Muara');
            $branch = $company->branches()->firstOrCreate(['name' => 'Main Branch'], [
                'address' => $company->office_address, 'district' => $company->district ?? $district,
            ]);
            if (!$company->district) {
                $company->update(['district' => $branch->district]);
            }
            foreach ($company->placementQuotas as $quota) {
                if (!$quota->branches()->exists()) {
                    $quota->branches()->attach($branch->id);
                }
            }
        }
    }
}
