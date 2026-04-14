<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProgrammeSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        DB::table('programmes')->truncate();

        Schema::enableForeignKeyConstraints();

        DB::table('programmes')->insert([
            // SICT (school_id = 1)
            [
                'programme_name' => 'Level 5 Diploma in Web Technology',
                'school_id' => 1
            ],
            [
                'programme_name' => 'Level 5 Diploma in Application Development',
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
                'programme_name' => 'Level 5 Diploma in Human Resource Management',
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
                'programme_name' => 'Level 5 Diploma in Petroleum Engineering',
                'school_id' => 3
            ],
            [
                'programme_name' => 'Level 5 Diploma in Architecture & Interior Design',
                'school_id' => 3
            ],
            // SHS (school_id = 4)
            [
                'programme_name' => 'Level 5 Diploma in Nursing',
                'school_id' => 4
            ],
            [
                'programme_name' => 'Level 5 Diploma in Midwifery',
                'school_id' => 4
            ],
            [
                'programme_name' => 'Level 5 Diploma in Paramedic Science',
                'school_id' => 4
            ],
        ]);
    }
}