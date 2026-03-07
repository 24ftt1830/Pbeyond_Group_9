<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id('application_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('quota_id');
            $table->timestamp('apply_date')->useCurrent();
            $table->enum('app_status', ['Pending', 'Reviewing', 'Approved', 'Rejected'])->default('Pending');
            $table->text('admin_remark')->nullable();
            $table->text('company_feedback')->nullable();

            $table->unique(['student_id', 'quota_id']);

            $table->foreign('student_id')
                  ->references('student_id')
                  ->on('students')
                  ->onDelete('cascade');
            $table->foreign('quota_id')
                  ->references('quota_id')
                  ->on('placement_quotas')
                  ->onDelete('cascade');
            $table->index('student_id');
            $table->index('quota_id');
            $table->index('app_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
