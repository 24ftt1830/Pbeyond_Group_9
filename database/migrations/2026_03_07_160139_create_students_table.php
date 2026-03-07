<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id('student_id');
            $table->string('pb_student_code', 50)->unique();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('full_name', 150);
            $table->string('ic_number', 20);
            $table->enum('ic_colour', ['Yellow', 'Red', 'Purple']);
            $table->unsignedBigInteger('programme_id');
            $table->string('intake_session', 50);
            $table->text('postal_address');
            $table->date('date_of_birth');
            $table->string('place_of_birth', 100);
            $table->enum('gender', ['Male', 'Female']);
            $table->string('religion', 50);
            $table->string('nationality', 100);
            $table->string('race', 50);
            $table->string('mobile_phone', 20);
            $table->decimal('cgpa', 3, 2);
            $table->text('work_experience')->nullable();
            $table->string('emergency_no', 20);
            $table->string('cv_file_path', 255)->nullable();
            $table->enum('vetting_status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');
            $table->foreign('programme_id')
                  ->references('programme_id')
                  ->on('programmes')
                  ->onDelete('restrict');
            $table->index('programme_id');
            $table->index('vetting_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
