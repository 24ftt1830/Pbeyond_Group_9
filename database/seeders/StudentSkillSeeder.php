<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentSkillSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('student_skills')->insert([
            // Student 1 (Ahmad)
            ['student_id' => 1, 'skill_name' => 'Python'],
            ['student_id' => 1, 'skill_name' => 'SQL'],
            ['student_id' => 1, 'skill_name' => 'JavaScript'],
            ['student_id' => 1, 'skill_name' => 'React'],
            // Student 2 (Sarah)
            ['student_id' => 2, 'skill_name' => 'Microsoft Excel'],
            ['student_id' => 2, 'skill_name' => 'WordPress'],
            ['student_id' => 2, 'skill_name' => 'Canva'],
            // Student 3 (John)
            ['student_id' => 3, 'skill_name' => 'Networking'],
            ['student_id' => 3, 'skill_name' => 'Cisco'],
            ['student_id' => 3, 'skill_name' => 'Linux'],
            ['student_id' => 3, 'skill_name' => 'AWS'],
            // Student 4 (Nurul)
            ['student_id' => 4, 'skill_name' => 'Microsoft Excel'],
            ['student_id' => 4, 'skill_name' => 'QuickBooks'],
            ['student_id' => 4, 'skill_name' => 'Xero'],
            // Student 5 (Faiz)
            ['student_id' => 5, 'skill_name' => 'Microsoft Office'],
            ['student_id' => 5, 'skill_name' => 'Communication'],
            // Student 6 (Wei Jie)
            ['student_id' => 6, 'skill_name' => 'AutoCAD'],
            ['student_id' => 6, 'skill_name' => 'SolidWorks'],
            ['student_id' => 6, 'skill_name' => 'MATLAB'],
            // Student 7 (Siti)
            ['student_id' => 7, 'skill_name' => 'Patient Care'],
            ['student_id' => 7, 'skill_name' => 'First Aid'],
            ['student_id' => 7, 'skill_name' => 'Medical Records'],
        ]);
    }
}
