<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE logbook_weekly_submissions
            MODIFY COLUMN status
            ENUM('submitted', 'pending', 'reviewed')
            NOT NULL
            DEFAULT 'submitted'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE logbook_weekly_submissions
            MODIFY COLUMN status
            ENUM('pending', 'reviewed')
            NOT NULL
            DEFAULT 'pending'
        ");
    }
};