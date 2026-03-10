<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id('company_id');
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('company_name', 150);
            $table->enum('location_type', ['Local', 'International']);
            $table->string('industry_sector', 100)->nullable();
            $table->text('office_address');
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');
            $table->index('location_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
