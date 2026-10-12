<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('final_internship_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('students', 'student_id')->cascadeOnDelete();
            $table->string('title');
            $table->longText('body');
            $table->timestamp('submitted_at')->nullable();
            $table->enum('academic_review_status', ['Pending Review', 'Approved', 'Changes Required'])->default('Pending Review');
            $table->text('academic_review_comments')->nullable();
            $table->timestamp('academic_reviewed_at')->nullable();
            $table->enum('industry_confirmation_status', ['Pending Confirmation', 'Confirmed', 'Changes Required'])->default('Pending Confirmation');
            $table->text('industry_confirmation_comments')->nullable();
            $table->timestamp('industry_confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_internship_reports');
    }
};
