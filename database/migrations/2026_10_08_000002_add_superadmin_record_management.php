<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        foreach (['evaluation_submissions', 'final_internship_reports'] as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->timestamp('reopened_at')->nullable();
                $table->foreignId('reopened_by_user_id')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            });
        }

        Schema::table('internship_completions', function (Blueprint $table) {
            $table->foreignId('industry_decided_by_user_id')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->foreignId('academic_decided_by_user_id')->nullable()->constrained('users', 'user_id')->nullOnDelete();
        });

        Schema::create('admin_record_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users', 'user_id')->nullOnDelete();
            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id');
            $table->string('action');
            $table->json('before_snapshot')->nullable();
            $table->json('after_snapshot')->nullable();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_record_changes');
        Schema::table('internship_completions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('industry_decided_by_user_id');
            $table->dropConstrainedForeignId('academic_decided_by_user_id');
        });
        foreach (['evaluation_submissions', 'final_internship_reports'] as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->dropConstrainedForeignId('reopened_by_user_id');
                $table->dropColumn('reopened_at');
            });
        }
    }
};
