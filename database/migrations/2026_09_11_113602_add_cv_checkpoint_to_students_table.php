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
        Schema::table('students', function (Blueprint $table) {
            $table->timestamp('cv_generated_at')
                ->nullable()
                ->after('cv_file_path');

            $table->json('cv_snapshot')
                ->nullable()
                ->after('cv_generated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'cv_generated_at',
                'cv_snapshot',
            ]);
        });
    }
};