<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('soft_skills', function (Blueprint $table) {
            $table->id();

            $table->foreignId('student_id')
            ->constrained('students', 'student_id')
            ->cascadeOnDelete();

            $table->string('skill');
            $table->text('description')->nullable();

            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soft_skills');
    }
};