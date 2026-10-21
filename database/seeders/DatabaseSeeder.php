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
            AcademicSemesterSeeder::class,
            CompanyBranchSeeder::class,
            PlacementQuotaSeeder::class,
            IldAdminSeeder::class,
            StudentSeeder::class,
            AcademicSupervisorSeeder::class,
            EvaluationTemplateSeeder::class,
        ]);
    }
}
