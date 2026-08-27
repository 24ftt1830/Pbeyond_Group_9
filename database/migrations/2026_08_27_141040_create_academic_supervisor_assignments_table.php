<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_supervisor_assignments', function (Blueprint $table) {
            $table->id('assignment_id');

            $table->unsignedBigInteger('academic_supervisor_id');
            $table->unsignedBigInteger('student_id');

            $table->timestamps();

            $table->unique(
                ['academic_supervisor_id', 'student_id'],
                'asv_student_unique'
            );

            $table->foreign('academic_supervisor_id')
                ->references('academic_supervisor_id')
                ->on('academic_supervisors')
                ->onDelete('cascade');

            $table->foreign('student_id')
                ->references('student_id')
                ->on('students')
                ->onDelete('cascade');

            $table->index('academic_supervisor_id');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_supervisor_assignments');
    }
};