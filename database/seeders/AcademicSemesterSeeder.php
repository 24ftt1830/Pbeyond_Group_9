<?php

namespace Database\Seeders;

use App\Models\AcademicSemester;
use Illuminate\Database\Seeder;

class AcademicSemesterSeeder extends Seeder
{
    public function run(): void
    {
        $firstYear = 2018;
        $lastYear = (int) date('Y') + 10;

        for ($year = $firstYear; $year <= $lastYear; $year++) {
            AcademicSemester::firstOrCreate(
                ['name' => "January {$year}"],
                ['starts_on' => "{$year}-01-01", 'ends_on' => "{$year}-06-30"]
            );

            AcademicSemester::firstOrCreate(
                ['name' => "July {$year}"],
                ['starts_on' => "{$year}-07-01", 'ends_on' => "{$year}-12-31"]
            );
        }
    }
}
