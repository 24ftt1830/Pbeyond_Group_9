<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupervisorAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('supervisor_assignments')->insert([
            [
                'supervisor_id' => 1,
                'student_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'supervisor_id' => 1,
                'student_id' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'supervisor_id' => 3,
                'student_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'supervisor_id' => 4,
                'student_id' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'supervisor_id' => 5,
                'student_id' => 6,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
