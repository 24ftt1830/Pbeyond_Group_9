<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentLanguageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('student_languages')->insert([
            // Student 1
            ['student_id' => 1, 'language_name' => 'English'],
            ['student_id' => 1, 'language_name' => 'Malay'],
            // Student 2
            ['student_id' => 2, 'language_name' => 'English'],
            ['student_id' => 2, 'language_name' => 'Malay'],
            ['student_id' => 2, 'language_name' => 'Mandarin'],
            // Student 3
            ['student_id' => 3, 'language_name' => 'English'],
            ['student_id' => 3, 'language_name' => 'Mandarin'],
            ['student_id' => 3, 'language_name' => 'Cantonese'],
            // Student 4
            ['student_id' => 4, 'language_name' => 'English'],
            ['student_id' => 4, 'language_name' => 'Malay'],
            ['student_id' => 4, 'language_name' => 'Arabic'],
            // Student 5
            ['student_id' => 5, 'language_name' => 'English'],
            ['student_id' => 5, 'language_name' => 'Malay'],
            // Student 6
            ['student_id' => 6, 'language_name' => 'English'],
            ['student_id' => 6, 'language_name' => 'Malay'],
            ['student_id' => 6, 'language_name' => 'Mandarin'],
            // Student 7
            ['student_id' => 7, 'language_name' => 'English'],
            ['student_id' => 7, 'language_name' => 'Malay'],
        ]);
    }
}
