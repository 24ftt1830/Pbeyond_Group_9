<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_supervisors', function (Blueprint $table) {
            $table->id('academic_supervisor_id');

            $table->unsignedBigInteger('user_id');

            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();

            $table->timestamps();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('cascade');

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_supervisors');
    }
};