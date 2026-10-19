<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicSupervisor;
use App\Models\AcademicSupervisorAssignment;
use App\Models\Student;

class AcademicSupervisorAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $assignments = [
            // Haji Ahmad: Web Technology.
            ['email' => 'academic.supervisor@pb.edu.bn', 'class_id' => 1],
            // Nur Afiqah: Accounting.
            ['email' => 'academic.supervisor2@pb.edu.bn', 'class_id' => 6],
        ];

        foreach ($assignments as $assignment) {
            $supervisor = AcademicSupervisor::where('email', $assignment['email'])->first();
            if (!$supervisor) continue;
            foreach (Student::whereHas('programme', fn ($query) => $query->where('class_id', $assignment['class_id']))->get() as $student) {
                AcademicSupervisorAssignment::firstOrCreate(['student_id' => $student->student_id], [
                    'academic_supervisor_id' => $supervisor->academic_supervisor_id,
                    'class_id' => null,
                    'monitoring_status' => 'On Track',
                ]);
            }
        }
    }
}
