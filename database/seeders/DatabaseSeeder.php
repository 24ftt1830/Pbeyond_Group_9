<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CompanySeeder::class,
            UserSeeder::class,
            SchoolSeeder::class,
            ProgrammeSeeder::class,
            IldAdminSeeder::class,
            StudentSeeder::class,
            //StudentSkillSeeder::class,
            //StudentLanguageSeeder::class,
            //PlacementQuotaSeeder::class,
            //ApplicationSeeder::class,
            //IndustrySupervisorSeeder::class,
            //SupervisorAssignmentSeeder::class,
        ]);
    }
}
