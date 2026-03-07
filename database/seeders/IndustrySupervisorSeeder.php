<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IndustrySupervisorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('industry_supervisors')->insert([
            [
                'company_id' => 1,
                'full_name' => 'Ali Tan Abdullah',
                'email' => 'ali.tan@techcorp.com',
                'phone' => '72345678',
                'position' => 'Technical Lead'
            ],
            [
                'company_id' => 1,
                'full_name' => 'Nurul Huda',
                'email' => 'nurul.huda@techcorp.com',
                'phone' => '73456789',
                'position' => 'HR Manager'
            ],
            [
                'company_id' => 2,
                'full_name' => 'Rina Wong',
                'email' => 'rina.wong@globaltech.com',
                'phone' => '+65 91234567',
                'position' => 'Regional Supervisor'
            ],
            [
                'company_id' => 3,
                'full_name' => 'Haji Ahmad Bin Hassan',
                'email' => 'ahmad.hassan@datatech.com',
                'phone' => '74567890',
                'position' => 'Data Science Manager'
            ],
            [
                'company_id' => 4,
                'full_name' => 'Lim Siew Ling',
                'email' => 'siewling.lim@shell.com',
                'phone' => '75678901',
                'position' => 'Engineering Supervisor'
            ],
        ]);
    }
}

