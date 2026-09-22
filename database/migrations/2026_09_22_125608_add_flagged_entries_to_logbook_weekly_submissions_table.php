<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->json('flagged_entries')->nullable()->after('supervisor_feedback');
        });
    }

    public function down(): void
    {
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->dropColumn('flagged_entries');
        });
    }
};