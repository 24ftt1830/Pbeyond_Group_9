<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicSupervisorSeeder extends Seeder
{
    public function run(): void
    {
        $supervisors = [
            [
                'user_email' => 'academic.supervisor@pb.edu.bn',
                'full_name' => 'Haji Ahmad bin Haji Omar',
                'email' => 'academic.supervisor@pb.edu.bn',
                'phone' => '81234567',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_email' => 'academic.supervisor2@pb.edu.bn',
                'full_name' => 'Dayang Nur Afiqah binti Salleh',
                'email' => 'academic.supervisor2@pb.edu.bn',
                'phone' => '82345678',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_email' => 'academic.supervisor3@pb.edu.bn',
                'full_name' => 'Daniel Lim Wei Jian',
                'email' => 'academic.supervisor3@pb.edu.bn',
                'phone' => '83456789',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($supervisors as $supervisor) {
            $userId = DB::table('users')
                ->where('email', $supervisor['user_email'])
                ->value('user_id');

            unset($supervisor['user_email']);
            $supervisor['user_id'] = $userId;

            DB::table('academic_supervisors')->updateOrInsert(
                ['email' => $supervisor['email']],
                $supervisor
            );
        }
    }
}
