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
        Schema::create('referees', function (Blueprint $table) {
            $table->id();

            $table->foreignId('student_id')
            ->constrained('students', 'student_id')
            ->cascadeOnDelete();

            $table->string('name');
            $table->string('position')->nullable();
            $table->string('organization')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();

            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referees');
    }
};