<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_supervisor_assignments', function (Blueprint $table) {
            $table->unsignedBigInteger('class_id')->nullable()->after('academic_supervisor_id');
        });

        DB::table('academic_supervisor_assignments')->orderBy('assignment_id')->each(function ($assignment) {
            $classId = DB::table('students')
                ->join('programmes', 'students.programme_id', '=', 'programmes.programme_id')
                ->where('students.student_id', $assignment->student_id)
                ->value('programmes.class_id');

            DB::table('academic_supervisor_assignments')
                ->where('assignment_id', $assignment->assignment_id)
                ->update(['class_id' => $classId]);
        });

        Schema::table('academic_supervisor_assignments', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropUnique('asv_student_unique');
            $table->dropIndex(['student_id']);
            $table->dropColumn('student_id');

            $table->foreign('class_id')
                ->references('class_id')
                ->on('programmes')
                ->onDelete('cascade');
            $table->index('class_id');
        });
    }

    public function down(): void
    {
        Schema::table('academic_supervisor_assignments', function (Blueprint $table) {
            $table->unsignedBigInteger('student_id')->nullable()->after('academic_supervisor_id');
        });

        DB::table('academic_supervisor_assignments')->orderBy('assignment_id')->each(function ($assignment) {
            $studentId = DB::table('students')
                ->join('programmes', 'students.programme_id', '=', 'programmes.programme_id')
                ->where('programmes.class_id', $assignment->class_id)
                ->value('students.student_id');

            DB::table('academic_supervisor_assignments')
                ->where('assignment_id', $assignment->assignment_id)
                ->update(['student_id' => $studentId]);
        });

        Schema::table('academic_supervisor_assignments', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropIndex(['class_id']);
            $table->dropColumn('class_id');

            $table->foreign('student_id')
                ->references('student_id')
                ->on('students')
                ->onDelete('cascade');
            $table->unique(['academic_supervisor_id', 'student_id'], 'asv_student_unique');
            $table->index('student_id');
        });
    }
};
