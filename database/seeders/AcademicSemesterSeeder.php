<?php

namespace Database\Seeders;

use App\Models\AcademicSemester;
use Illuminate\Database\Seeder;

class AcademicSemesterSeeder extends Seeder
{
    public function run(): void
    {
        $firstYear = 2024;
        $lastYear = (int) now('Asia/Brunei')->year + 10;

        for ($year = $firstYear; $year <= $lastYear; $year++) {
            if ($year > $firstYear) {
                AcademicSemester::firstOrCreate(
                    ['name' => AcademicSemester::sessionName($year, false)],
                    ['starts_on' => "{$year}-01-01", 'ends_on' => "{$year}-06-30"]
                );
            }

            AcademicSemester::firstOrCreate(
                ['name' => AcademicSemester::sessionName($year, true)],
                ['starts_on' => "{$year}-07-01", 'ends_on' => "{$year}-12-31"]
            );
        }
    }
}
