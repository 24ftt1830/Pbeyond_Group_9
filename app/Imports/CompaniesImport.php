<?php

namespace App\Imports;

use App\Models\Company;
use App\Models\CompanyBranch;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CompaniesImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row): Company
    {
        $company = Company::firstOrCreate(
            ['company_name' => trim($row['company_name'])],
            [
                'location_type' => 'Local',
                'industry_sector' => trim($row['industry_sector']),
                'office_address' => trim($row['office_address']),
                'district' => $row['district'] ?? null,
                'is_approved' => true,
            ]
        );
        if (!$company->branches()->exists()) {
            $company->branches()->create([
                'name' => 'Main Branch', 'address' => $company->office_address,
                'district' => $company->district,
            ]);
        }
        return $company;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:150'],
            'industry_sector' => ['required', 'string', 'max:100'],
            'office_address' => ['required', 'string'],
            'district' => ['nullable', Rule::in(CompanyBranch::DISTRICTS)],
        ];
    }
}
