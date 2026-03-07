<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id('school_id');
            $table->string('school_code', 10)->unique();
            $table->string('school_name', 150);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
