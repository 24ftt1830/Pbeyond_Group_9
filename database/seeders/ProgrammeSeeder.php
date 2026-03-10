<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgrammeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('programmes')->insert([
            // SICT (school_id = 1)
            [
                'programme_name' => 'Level 5 Diploma in Web Technology',
                'school_id' => 1
            ],
            [
                'programme_name' => 'Level 5 Diploma in Data Analytics',
                'school_id' => 1
            ],
            [
                'programme_name' => 'Level 5 Diploma in Cybersecurity',
                'school_id' => 1
            ],
            [
                'programme_name' => 'Level 5 Diploma in Networking',
                'school_id' => 1
            ],
            // SBA (school_id = 2)
            [
                'programme_name' => 'Level 5 Diploma in Accounting',
                'school_id' => 2
            ],
            [
                'programme_name' => 'Level 5 Diploma in Business Management',
                'school_id' => 2
            ],
            [
                'programme_name' => 'Level 5 Diploma in Finance',
                'school_id' => 2
            ],
            [
                'programme_name' => 'Level 5 Diploma in Marketing',
                'school_id' => 2
            ],
            // SSE (school_id = 3)
            [
                'programme_name' => 'Level 5 Diploma in Mechanical Engineering',
                'school_id' => 3
            ],
            [
                'programme_name' => 'Level 5 Diploma in Electrical Engineering',
                'school_id' => 3
            ],
            [
                'programme_name' => 'Level 5 Diploma in Civil Engineering',
                'school_id' => 3
            ],
            [
                'programme_name' => 'Level 5 Diploma in Petroleum Engineering',
                'school_id' => 3
            ],
            // SHS (school_id = 4)
            [
                'programme_name' => 'Level 5 Diploma in Nursing',
                'school_id' => 4
            ],
            [
                'programme_name' => 'Level 5 Diploma in Pharmacy',
                'school_id' => 4
            ],
            [
                'programme_name' => 'Level 5 Diploma in Medical Lab Technology',
                'school_id' => 4
            ],
        ]);
    }
}
