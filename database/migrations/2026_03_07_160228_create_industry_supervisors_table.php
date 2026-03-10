<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('industry_supervisors', function (Blueprint $table) {
            $table->id('supervisor_id');
            $table->unsignedBigInteger('company_id');
            $table->string('full_name', 150);
            $table->string('email', 150);
            $table->string('phone', 20)->nullable();
            $table->string('position', 100)->nullable();

            $table->foreign('company_id')
                  ->references('company_id')
                  ->on('companies')
                  ->onDelete('cascade');
            $table->index('company_id');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('industry_supervisors');
    }
};
