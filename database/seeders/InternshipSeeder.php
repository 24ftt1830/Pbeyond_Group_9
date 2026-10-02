<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InternshipSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('internships')->insert([
            [
                'student_id' => 1,
                'start_date' => '2026-08-03',
                'end_date' => '2026-11-27',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_id' => 2,
                'start_date' => '2026-08-03',
                'end_date' => '2026-11-27',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_id' => 3,
                'start_date' => '2026-08-03',
                'end_date' => '2026-11-27',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_id' => 4,
                'start_date' => '2026-08-03',
                'end_date' => '2026-11-27',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_id' => 5,
                'start_date' => '2026-08-03',
                'end_date' => '2026-11-27',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_id' => 6,
                'start_date' => '2026-08-03',
                'end_date' => '2026-11-27',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}