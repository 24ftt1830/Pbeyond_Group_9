<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentSkillSeeder extends Seeder
{
    public function run(): void
    {
        $examples = [
            // Student 1 (Ahmad)
            ['student_code' => '24FTT001', 'skill_name' => 'HTML and CSS'],
            ['student_code' => '24FTT001', 'skill_name' => 'PHP'],
            ['student_code' => '24FTT001', 'skill_name' => 'JavaScript'],
            ['student_code' => '24FTT001', 'skill_name' => 'React'],
            // Student 2 (Sarah)
            ['student_code' => '24FTT002', 'skill_name' => 'Java'],
            ['student_code' => '24FTT002', 'skill_name' => 'Database Design'],
            ['student_code' => '24FTT002', 'skill_name' => 'Git'],
            // Student 3 (John)
            ['student_code' => '24FTT003', 'skill_name' => 'Python'],
            ['student_code' => '24FTT003', 'skill_name' => 'SQL'],
            ['student_code' => '24FTT003', 'skill_name' => 'Microsoft Excel'],
            ['student_code' => '24FTT003', 'skill_name' => 'Data Visualization'],
            // Student 4 (Nurul)
            ['student_code' => '24FTB001', 'skill_name' => 'Microsoft Excel'],
            ['student_code' => '24FTB001', 'skill_name' => 'QuickBooks'],
            ['student_code' => '24FTB001', 'skill_name' => 'Xero'],
            // Student 5 (Faiz)
            ['student_code' => '24FTB002', 'skill_name' => 'Microsoft Office'],
            ['student_code' => '24FTB002', 'skill_name' => 'Communication'],
            // Student 6 (Wei Jie)
            ['student_code' => '24FTE001', 'skill_name' => 'AutoCAD'],
            ['student_code' => '24FTE001', 'skill_name' => 'SolidWorks'],
            ['student_code' => '24FTE001', 'skill_name' => 'MATLAB'],
            // Student 7 (Siti)
            ['student_code' => '24FTH001', 'skill_name' => 'Patient Care'],
            ['student_code' => '24FTH001', 'skill_name' => 'First Aid'],
            ['student_code' => '24FTH001', 'skill_name' => 'Medical Records'],
        ];
        foreach ($examples as $example) {
            $studentId = DB::table('students')->where('pb_student_code', $example['student_code'])->value('student_id');
            if (!$studentId) continue;
            DB::table('student_skills')->updateOrInsert(['student_id' => $studentId, 'skill_name' => $example['skill_name']], []);
        }
    }
}
