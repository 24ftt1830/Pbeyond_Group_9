<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IldAdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('ild_admins')->insert([
            [
                'user_id' => 1,
                'full_name' => 'Mr. Lim Swee Kim',
                'school_id' => 1,
                'privilege_level' => 'Head'
            ],
        ]);
    }
}
