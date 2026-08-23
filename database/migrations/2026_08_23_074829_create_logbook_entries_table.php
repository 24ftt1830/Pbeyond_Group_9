<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logbook_entries', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('student_id');

            $table->date('date');

            $table->enum('status', [
                'working',
                'off',
            ]);

            $table->string('title', 255)->nullable();

            $table->text('description')->nullable();

            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('students')
                ->onDelete('cascade');

            $table->unique(['student_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbook_entries');
    }
};