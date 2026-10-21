<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentLanguageSeeder extends Seeder
{
    public function run(): void
    {
        $examples = [
            // Student 1
            ['student_code' => '24FTT001', 'language_name' => 'English'],
            ['student_code' => '24FTT001', 'language_name' => 'Malay'],
            // Student 2
            ['student_code' => '24FTT002', 'language_name' => 'English'],
            ['student_code' => '24FTT002', 'language_name' => 'Malay'],
            ['student_code' => '24FTT002', 'language_name' => 'Mandarin'],
            // Student 3
            ['student_code' => '24FTT003', 'language_name' => 'English'],
            ['student_code' => '24FTT003', 'language_name' => 'Mandarin'],
            ['student_code' => '24FTT003', 'language_name' => 'Cantonese'],
            // Student 4
            ['student_code' => '24FTB001', 'language_name' => 'English'],
            ['student_code' => '24FTB001', 'language_name' => 'Malay'],
            ['student_code' => '24FTB001', 'language_name' => 'Arabic'],
            // Student 5
            ['student_code' => '24FTB002', 'language_name' => 'English'],
            ['student_code' => '24FTB002', 'language_name' => 'Malay'],
            // Student 6
            ['student_code' => '24FTE001', 'language_name' => 'English'],
            ['student_code' => '24FTE001', 'language_name' => 'Malay'],
            ['student_code' => '24FTE001', 'language_name' => 'Mandarin'],
            // Student 7
            ['student_code' => '24FTH001', 'language_name' => 'English'],
            ['student_code' => '24FTH001', 'language_name' => 'Malay'],
        ];
        foreach ($examples as $example) {
            $studentId = DB::table('students')->where('pb_student_code', $example['student_code'])->value('student_id');
            if (!$studentId) continue;
            DB::table('student_languages')->updateOrInsert(['student_id' => $studentId, 'language_name' => $example['language_name']], []);
        }
    }
}
