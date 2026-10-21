<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IldAdminSeeder extends Seeder
{
    public function run(): void
    {
        $userId = DB::table('users')->where('email', 'admin.sict@pb.edu.bn')->value('user_id');
        $schoolId = DB::table('schools')->where('school_code', 'SICT')->value('school_id');
        if (!$userId || !$schoolId) return;
        DB::table('ild_admins')->updateOrInsert(['user_id' => $userId], [
                'full_name' => 'Mr. Lim Swee Kim',
                'school_id' => $schoolId,
                'privilege_level' => 'Head'
        ]);
    }
}
