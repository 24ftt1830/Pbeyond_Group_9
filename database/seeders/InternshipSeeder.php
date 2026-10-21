<?php

namespace Database\Seeders;

use App\Models\AcademicSemester;
use App\Models\Application;
use App\Services\InternshipWorkflow;
use Illuminate\Database\Seeder;

/** Optional: only schedule students already recruited into the matching term. */
class InternshipSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Application::where('app_status', 'Recruited')->with(['student.internship', 'quota.company.users'])->get() as $application) {
            $student = $application->student;
            if (!$student || $student->internship) continue;
            $term = AcademicSemester::internshipTermForIntake((int) $student->intake_semester_id);
            if (!$term || (int) $term->id !== (int) $application->quota?->academic_semester_id) continue;
            $hr = $application->quota->company?->users->firstWhere('role', 'Company');
            if (!$hr || $term->starts_on->copy()->addDay()->gt($term->ends_on)) continue;
            app(InternshipWorkflow::class)->dates($student, [
                'start_date' => $term->starts_on->copy()->addDay()->toDateString(),
                'end_date' => $term->ends_on->toDateString(),
            ], $hr);
        }
    }
}
