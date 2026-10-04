<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicSupervisorAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $assignments = [
            // Haji Ahmad: Web Technology.
            ['email' => 'academic.supervisor@pb.edu.bn', 'class_id' => 1],
            // Nur Afiqah: Accounting.
            ['email' => 'academic.supervisor2@pb.edu.bn', 'class_id' => 6],
            // Daniel: Nursing.
            ['email' => 'academic.supervisor3@pb.edu.bn', 'class_id' => 13],
        ];

        $supervisorIds = [];
        foreach ($assignments as $assignment) {
            $supervisorId = DB::table('academic_supervisors')
                ->where('email', $assignment['email'])
                ->value('academic_supervisor_id');

            $supervisorIds[] = $supervisorId;
        }

        // Keep only the three seeded class assignments; programme rows remain untouched.
        DB::table('academic_supervisor_assignments')
            ->whereIn('academic_supervisor_id', $supervisorIds)
            ->delete();

        foreach ($assignments as $assignment) {
            $supervisorId = DB::table('academic_supervisors')
                ->where('email', $assignment['email'])
                ->value('academic_supervisor_id');

            DB::table('academic_supervisor_assignments')->insert([
                'academic_supervisor_id' => $supervisorId,
                'class_id' => $assignment['class_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
