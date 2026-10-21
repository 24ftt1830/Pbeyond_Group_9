<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Company;
use Database\Seeders\Support\DemoCompanies;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // Admin
            [
                'username' => 'admin_sict',
                'email' => 'admin.sict@pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Admin',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SICT Students (FTT)
            [
                'username' => '24FTT001',
                'email' => '24FTT001@student.pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Student',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => '24FTT002',
                'email' => '24FTT002@student.pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Student',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => '24FTT003',
                'email' => '24FTT003@student.pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Student',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SBA Students (FTB)
            [
                'username' => '24FTB001',
                'email' => '24FTB001@student.pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Student',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => '24FTB002',
                'email' => '24FTB002@student.pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Student',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SSE Students (FTE)
            [
                'username' => '24FTE001',
                'email' => '24FTE001@student.pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Student',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SHS Students (FTH)
            [
                'username' => '24FTH001',
                'email' => '24FTH001@student.pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Student',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Academic Supervisors
            [
                'username' => 'academic_supervisor',
                'email' => 'academic.supervisor@pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Academic Supervisor',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'academic_supervisor2',
                'email' => 'academic.supervisor2@pb.edu.bn',
                'password' => Hash::make('password123'),
                'role' => 'Academic Supervisor',
                'company_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach (DemoCompanies::all() as $company) {
            $accounts[] = [...$company['hr'], 'password' => Hash::make('password123'), 'role' => 'Company',
                'company_id' => Company::where('company_name', $company['name'])->firstOrFail()->company_id];
        }
        foreach ($accounts as $account) {
            if ($account['role'] === 'Student') {
                $account['password'] = Hash::make(Str::random(64));
                $username = $account['username'];
                unset($account['username']);
                // An edited student email must survive future demo seed runs.
                User::firstOrCreate(['username' => $username, 'role' => 'Student'], $account);
                continue;
            }
            $email = $account['email'];
            unset($account['email']);
            User::firstOrCreate(['email' => $email], $account);
        }
    }
}
