<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supervisor_assignments', function (Blueprint $table) {
            $table->id('assignment_id');
            $table->unsignedBigInteger('supervisor_id');
            $table->unsignedBigInteger('student_id');
            $table->timestamps();

            $table->unique(['supervisor_id', 'student_id']);

            $table->foreign('supervisor_id')
                  ->references('supervisor_id')
                  ->on('industry_supervisors')
                  ->onDelete('cascade');
            $table->foreign('student_id')
                  ->references('student_id')
                  ->on('students')
                  ->onDelete('cascade');
            $table->index('supervisor_id');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervisor_assignments');
    }
};
