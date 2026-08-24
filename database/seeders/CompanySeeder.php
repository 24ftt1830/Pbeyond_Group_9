<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('companies')->insert([
            [
                'company_name' => 'TechCorp Brunei',
                'location_type' => 'Local',
                'industry_sector' => 'IT Services',
                'office_address' => 'Unit 12-15, Technology Park, Gadong, Bandar Seri Begawan',
                'access_key' => Hash::make('123456'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_name' => 'GlobalTech Solutions',
                'location_type' => 'International',
                'industry_sector' => 'Software Development',
                'office_address' => 'Level 20, Marina Bay Financial Centre, Singapore',
                'access_key' => Hash::make('234567'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_name' => 'DataTech Analytics',
                'location_type' => 'Local',
                'industry_sector' => 'Data Analytics',
                'office_address' => 'No. 45, Jalan Sultan, Bandar Seri Begawan',
                'access_key' => Hash::make('345678'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_name' => 'Brunei Shell Petroleum',
                'location_type' => 'Local',
                'industry_sector' => 'Oil & Gas',
                'office_address' => 'Panaga, Seria, Belait',
                'access_key' => Hash::make('456789'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}