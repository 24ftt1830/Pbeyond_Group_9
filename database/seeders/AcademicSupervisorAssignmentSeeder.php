<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicSupervisorAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('academic_supervisor_assignments')->insert([
            [
                'academic_supervisor_id' => 1,
                'student_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'academic_supervisor_id' => 1,
                'student_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}