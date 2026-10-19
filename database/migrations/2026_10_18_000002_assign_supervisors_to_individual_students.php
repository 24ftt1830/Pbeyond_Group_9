<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Check conflicts before making schema changes. Existing decisions must not
        // silently be reassigned to a different supervisor during this conversion.
        $classes = DB::table('academic_supervisor_assignments')
            ->whereNotNull('class_id')->get()->groupBy('class_id');
        foreach ($classes as $classId => $assignments) {
            if ($assignments->pluck('academic_supervisor_id')->unique()->count() > 1
                && DB::table('students')->join('programmes', 'students.programme_id', '=', 'programmes.programme_id')
                    ->where('programmes.class_id', $classId)->exists()) {
                throw new RuntimeException("Class {$classId} has multiple PB Supervisors. Resolve its assignments before migrating. No assignments were changed.");
            }
        }

        $industryAssignments = DB::table('supervisor_assignments')->get();
        $legacyIndustry = DB::table('applications')
            ->join('placement_quotas', 'placement_quotas.quota_id', '=', 'applications.quota_id')
            ->join('industry_supervisors', function ($join) {
                $join->on('industry_supervisors.quota_id', '=', 'applications.quota_id')
                    ->on('industry_supervisors.company_id', '=', 'placement_quotas.company_id');
            })
            ->where('applications.app_status', 'Recruited')
            ->get(['applications.student_id', 'industry_supervisors.supervisor_id']);
        foreach ($industryAssignments->concat($legacyIndustry)->groupBy('student_id') as $studentId => $assignments) {
            if ($assignments->pluck('supervisor_id')->unique()->count() > 1) {
                throw new RuntimeException("Student {$studentId} has multiple Industry Supervisors. Resolve the assignments before migrating. No assignments were changed.");
            }
        }

        Schema::table('academic_supervisor_assignments', function (Blueprint $table) {
            $table->unsignedBigInteger('student_id')->nullable();
            $table->foreign('student_id')->references('student_id')->on('students')->cascadeOnDelete();
            $table->unique('student_id', 'academic_one_supervisor_per_student');
        });

        DB::transaction(function () use ($classes, $legacyIndustry) {
            foreach ($classes as $classId => $assignments) {
                $source = $assignments->first();
                $studentIds = DB::table('students')->join('programmes', 'students.programme_id', '=', 'programmes.programme_id')
                    ->where('programmes.class_id', $classId)->pluck('students.student_id');
                $visits = DB::table('academic_supervisor_visits')->whereIn('assignment_id', $assignments->pluck('assignment_id'))->get();
                foreach ($studentIds as $studentId) {
                    $assignmentId = DB::table('academic_supervisor_assignments')->insertGetId([
                        'academic_supervisor_id' => $source->academic_supervisor_id,
                        'student_id' => $studentId,
                        'class_id' => null,
                        'monitoring_status' => $source->monitoring_status ?? 'On Track',
                        'created_at' => $source->created_at,
                        'updated_at' => $source->updated_at,
                    ], 'assignment_id');
                    foreach ($visits as $visit) {
                        DB::table('academic_supervisor_visits')->insert([
                            'assignment_id' => $assignmentId,
                            'visit_date' => $visit->visit_date,
                            'notes' => $visit->notes,
                            'created_at' => $visit->created_at,
                            'updated_at' => $visit->updated_at,
                        ]);
                    }
                }
                // Keep the original class rows and visits as historical records.
                // Runtime relations only use the new student-specific rows.
            }
            foreach ($legacyIndustry->unique('student_id') as $assignment) {
                DB::table('supervisor_assignments')->updateOrInsert(
                    ['student_id' => $assignment->student_id],
                    ['supervisor_id' => $assignment->supervisor_id, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        });

        Schema::table('supervisor_assignments', function (Blueprint $table) {
            $table->unique('student_id', 'industry_one_supervisor_per_student');
        });
    }

    public function down(): void
    {
        Schema::table('supervisor_assignments', function (Blueprint $table) {
            $table->dropUnique('industry_one_supervisor_per_student');
        });
        $directAssignmentIds = DB::table('academic_supervisor_assignments')->whereNotNull('student_id')->pluck('assignment_id');
        DB::table('academic_supervisor_visits')->whereIn('assignment_id', $directAssignmentIds)->delete();
        DB::table('academic_supervisor_assignments')->whereIn('assignment_id', $directAssignmentIds)->delete();
        Schema::table('academic_supervisor_assignments', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropUnique('academic_one_supervisor_per_student');
            $table->dropColumn('student_id');
        });
    }
};
