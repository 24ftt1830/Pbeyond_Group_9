<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id('evaluation_id');

            $table->foreignId('student_id')
                ->constrained('students', 'student_id')
                ->cascadeOnDelete();

            $table->foreignId('industry_supervisor_id')
                ->constrained('industry_supervisors', 'supervisor_id')
                ->cascadeOnDelete();

            // Rubric scores, 1 (poor) - 5 (excellent)
            $table->unsignedTinyInteger('attendance_punctuality');
            $table->unsignedTinyInteger('work_quality');
            $table->unsignedTinyInteger('technical_skills');
            $table->unsignedTinyInteger('communication_skills');
            $table->unsignedTinyInteger('teamwork');
            $table->unsignedTinyInteger('initiative');
            $table->unsignedTinyInteger('professionalism');

            // Written feedback
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->text('comments')->nullable();

            $table->enum('recommendation', [
                'Highly Recommended',
                'Recommended',
                'Recommended with Reservations',
                'Not Recommended',
            ]);

            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();

            // One evaluation per student per supervisor (edit in place instead of duplicating)
            $table->unique(['student_id', 'industry_supervisor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};