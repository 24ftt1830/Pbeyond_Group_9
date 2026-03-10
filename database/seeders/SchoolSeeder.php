<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('schools')->insert([
            [
                'school_code' => 'SICT',
                'school_name' => 'School of Information and Communication Technology'
            ],
            [
                'school_code' => 'SBA',
                'school_name' => 'School of Business'
            ],
            [
                'school_code' => 'SSE',
                'school_name' => 'School of Engineering'
            ],
            [
                'school_code' => 'SHS',
                'school_name' => 'School of Health Sciences'
            ],
        ]);
    }
}
