<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AcademicSupervisorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            // Academic Supervisor
            [
                'username' => 'academic_supervisor',
                'email' => 'academic.supervisor@pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Academic Supervisor',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}