<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            // Admin
            [
                'username' => 'admin_sict',
                'email' => 'admin.sict@pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Admin',
                'created_at' => now()
            ],
            // SICT Students (FTT)
            [
                'username' => '24FTT001',
                'email' => '24FTT001@student.pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Student',
                'created_at' => now()
            ],
            [
                'username' => '24FTT002',
                'email' => '24FTT002@student.pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Student',
                'created_at' => now()
            ],
            [
                'username' => '24FTT003',
                'email' => '24FTT003@student.pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Student',
                'created_at' => now()
            ],
            // SBA Students (FTB)
            [
                'username' => '24FTB001',
                'email' => '24FTB001@student.pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Student',
                'created_at' => now()
            ],
            [
                'username' => '24FTB002',
                'email' => '24FTB002@student.pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Student',
                'created_at' => now()
            ],
            // SSE Students (FTE)
            [
                'username' => '24FTE001',
                'email' => '24FTE001@student.pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Student',
                'created_at' => now()
            ],
            // SHS Students (FTH)
            [
                'username' => '24FTH001',
                'email' => '24FTH001@student.pb.edu.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Student',
                'created_at' => now()
            ],
            // Companies
            [
                'username' => 'techcorp_hr',
                'email' => 'hr@techcorp.com',
                'password_hash' => Hash::make('password123'),
                'role' => 'Company',
                'created_at' => now()
            ],
            [
                'username' => 'globaltech_hr',
                'email' => 'hr@globaltech.com',
                'password_hash' => Hash::make('password123'),
                'role' => 'Company',
                'created_at' => now()
            ],
            [
                'username' => 'datatech_hr',
                'email' => 'hr@datatech.com.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Company',
                'created_at' => now()
            ],
            [
                'username' => 'brunei_shell',
                'email' => 'hr@shell.com.bn',
                'password_hash' => Hash::make('password123'),
                'role' => 'Company',
                'created_at' => now()
            ],
        ]);
    }
}
