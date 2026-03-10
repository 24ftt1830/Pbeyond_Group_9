<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('companies')->insert([
            [
                'user_id' => 9,
                'company_name' => 'TechCorp Brunei',
                'location_type' => 'Local',
                'industry_sector' => 'IT Services',
                'office_address' => 'Unit 12-15, Technology Park, Gadong, Bandar Seri Begawan',
                'created_at' => now()
            ],
            [
                'user_id' => 10,
                'company_name' => 'GlobalTech Solutions',
                'location_type' => 'International',
                'industry_sector' => 'Software Development',
                'office_address' => 'Level 20, Marina Bay Financial Centre, Singapore',
                'created_at' => now()
            ],
            [
                'user_id' => 11,
                'company_name' => 'DataTech Analytics',
                'location_type' => 'Local',
                'industry_sector' => 'Data Analytics',
                'office_address' => 'No. 45, Jalan Sultan, Bandar Seri Begawan',
                'created_at' => now()
            ],
            [
                'user_id' => 12,
                'company_name' => 'Brunei Shell Petroleum',
                'location_type' => 'Local',
                'industry_sector' => 'Oil & Gas',
                'office_address' => 'Panaga, Seria, Belait',
                'created_at' => now()
            ],
        ]);
    }
}
