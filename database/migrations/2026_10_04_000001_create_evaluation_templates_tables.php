<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('evaluation_templates', function (Blueprint $table) {
            $table->id();
            $table->enum('supervisor_type', ['Academic Supervisor', 'Industry Supervisor']);
            $table->string('name');
            $table->unsignedInteger('version')->default(1);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            $table->unique(['supervisor_type', 'version']);
        });

        Schema::create('evaluation_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_template_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('evaluation_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_section_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('evaluation_rating_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_criterion_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('points')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('evaluation_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_template_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('template_version');
            $table->foreignId('student_id')->constrained('students', 'student_id')->cascadeOnDelete();
            $table->enum('supervisor_type', ['Academic Supervisor', 'Industry Supervisor']);
            $table->unsignedBigInteger('academic_supervisor_id')->nullable();
            $table->unsignedBigInteger('industry_supervisor_id')->nullable();
            $table->json('template_snapshot');
            $table->json('answers');
            $table->decimal('overall_score', 7, 2);
            $table->text('comments')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();
            $table->foreign('academic_supervisor_id')->references('academic_supervisor_id')->on('academic_supervisors')->cascadeOnDelete();
            $table->foreign('industry_supervisor_id')->references('supervisor_id')->on('industry_supervisors')->cascadeOnDelete();
            $table->unique(['evaluation_template_id', 'student_id', 'academic_supervisor_id', 'industry_supervisor_id'], 'evaluation_submission_owner_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_submissions');
        Schema::dropIfExists('evaluation_rating_levels');
        Schema::dropIfExists('evaluation_criteria');
        Schema::dropIfExists('evaluation_sections');
        Schema::dropIfExists('evaluation_templates');
    }
};
