<?php

namespace App\Imports;

use App\Models\Company;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CompaniesImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row): Company
    {
        return Company::firstOrCreate(
            ['company_name' => trim($row['company_name'])],
            [
                'location_type' => 'Local',
                'industry_sector' => trim($row['industry_sector']),
                'office_address' => trim($row['office_address']),
                'is_approved' => true,
            ]
        );
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:150'],
            'industry_sector' => ['required', 'string', 'max:100'],
            'office_address' => ['required', 'string'],
        ];
    }
}
