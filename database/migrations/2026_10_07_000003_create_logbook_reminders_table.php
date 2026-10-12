<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logbook_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')
                ->constrained('students', 'student_id')
                ->cascadeOnDelete();
            $table->date('week_start');
            $table->foreignId('sent_by_user_id')
                ->nullable()
                ->constrained('users', 'user_id')
                ->nullOnDelete();
            $table->timestamp('sent_at');
            $table->timestamps();

            $table->unique(['student_id', 'week_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbook_reminders');
    }
};
