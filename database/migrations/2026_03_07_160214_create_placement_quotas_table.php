<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('placement_quotas', function (Blueprint $table) {
            $table->id('quota_id');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('programme_id');
            $table->string('job_title', 150);
            $table->text('job_description')->nullable();
            $table->integer('total_slots');
            $table->decimal('min_cgpa', 3, 2)->default(0.00);
            $table->enum('quota_status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->boolean('is_released')->default(false);
            $table->timestamps();

            $table->foreign('company_id')
                  ->references('company_id')
                  ->on('companies')
                  ->onDelete('cascade');
            $table->foreign('programme_id')
                  ->references('programme_id')
                  ->on('programmes')
                  ->onDelete('restrict');
            $table->index('company_id');
            $table->index('programme_id');
            $table->index(['quota_status', 'is_released']);

            $table->check('total_slots > 0');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('placement_quotas');
    }
};
