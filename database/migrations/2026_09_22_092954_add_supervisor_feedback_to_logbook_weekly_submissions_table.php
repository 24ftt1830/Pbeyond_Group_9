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
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            // Add a text column for feedback that can be empty (nullable)
            $table->text('supervisor_feedback')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->dropColumn('supervisor_feedback');
        });
    }
};
