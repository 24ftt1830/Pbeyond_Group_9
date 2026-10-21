<?php

namespace Database\Seeders;

use App\Models\Company;
use Database\Seeders\Support\DemoCompanies;
use Illuminate\Database\Seeder;

class CompanyBranchSeeder extends Seeder
{
    public function run(): void
    {
        $examples = collect(DemoCompanies::all())->keyBy('name');
        foreach (Company::with('placementQuotas')->get() as $company) {
            $example = $examples->get($company->company_name);
            $district = $company->district ?? $example['district'] ??
                (in_array($company->location_type, ['International', 'Overseas'], true) ? 'Overseas' : 'Brunei-Muara');
            $main = $company->branches()->firstOrCreate(['name' => 'Main Branch'], [
                'address' => $company->office_address, 'district' => $district,
            ]);
            if (!$company->district) $company->update(['district' => $main->district]);
            if ($example) {
                $company->branches()->firstOrCreate(['name' => $example['branch']['name']], [
                    'address' => $example['branch']['address'], 'district' => $example['branch']['district'],
                ]);
            }
            foreach ($company->placementQuotas as $quota) {
                if (!$quota->branches()->exists()) $quota->branches()->attach($main->id);
            }
        }
    }
}
