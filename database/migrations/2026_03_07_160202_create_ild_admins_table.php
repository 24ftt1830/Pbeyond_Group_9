<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ild_admins', function (Blueprint $table) {
            $table->id('admin_id');
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('full_name', 150);
            $table->unsignedBigInteger('school_id');
            $table->enum('privilege_level', ['Staff', 'Head']);

            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');
            $table->foreign('school_id')
                  ->references('school_id')
                  ->on('schools')
                  ->onDelete('restrict');
            $table->index('school_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ild_admins');
    }
};
