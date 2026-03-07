<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programmes', function (Blueprint $table) {
            $table->id('programme_id');
            $table->string('programme_name', 150);
            $table->unsignedBigInteger('school_id');
            $table->foreign('school_id')
                  ->references('school_id')
                  ->on('schools')
                  ->onDelete('restrict');
            $table->index('school_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programmes');
    }
};
