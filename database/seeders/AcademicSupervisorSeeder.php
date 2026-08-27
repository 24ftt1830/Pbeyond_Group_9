<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicSupervisorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('academic_supervisors')->insert([
            [
                'user_id' => 9,
                'full_name' => 'Academic Supervisor',
                'email' => 'academic.supervisor@pb.edu.bn',
                'phone' => '81234567',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}