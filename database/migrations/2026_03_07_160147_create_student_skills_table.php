<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_skills', function (Blueprint $table) {
            $table->id('skill_id');
            $table->unsignedBigInteger('student_id');
            $table->string('skill_name', 100);

            $table->foreign('student_id')
                  ->references('student_id')
                  ->on('students')
                  ->onDelete('cascade');
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_skills');
    }
};
