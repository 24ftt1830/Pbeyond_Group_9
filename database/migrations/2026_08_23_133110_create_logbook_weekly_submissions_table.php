<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logbook_weekly_submissions', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('student_id');

            $table->date('week_start');
            $table->date('week_end');

            $table->enum('status', [
                'submitted',
                'reviewed',
            ])->default('submitted');

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('students')
                ->onDelete('cascade');

            $table->unique([
                'student_id',
                'week_start',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbook_weekly_submissions');
    }
};