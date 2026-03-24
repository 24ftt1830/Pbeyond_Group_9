<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
<<<<<<< HEAD
use Illuminate\Support\Facades\DB; // Add this at the top
=======
use Illuminate\Support\Facades\DB;
>>>>>>> 2d14bf3 (renamed 'password_hash' field to 'password' for laravel strict compatibility requirement and updated all relevant code references in controllers, migrations, seeders etc.)

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


            // Removed the $table->check() line due to compatibility issues with mysql
        });

        // Instead, apply the constraint via raw SQL
        DB::statement('ALTER TABLE placement_quotas ADD CONSTRAINT chk_total_slots_positive CHECK (total_slots > 0);');
    }

    public function down(): void
    {
        // Drop the constraint first (optional, but good practice)
        DB::statement('ALTER TABLE placement_quotas DROP CONSTRAINT IF EXISTS check_total_slots_positive;');
        Schema::dropIfExists('placement_quotas');
    }
};
