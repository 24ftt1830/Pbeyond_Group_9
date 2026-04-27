<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
	Schema::table('applications', function ($table) {
	    $table->renameColumn('status', 'app_status');
	});

        // Step 1: Add new status values to the ENUM temporarily (keep old ones)
        DB::statement("ALTER TABLE applications MODIFY app_status ENUM('Pending', 'Reviewing', 'Approved', 'Rejected', 'Pending_ILD', 'Pending_Company', 'Interview_Scheduled') DEFAULT 'Pending'");

        // Step 2: Convert existing rows
        DB::table('applications')->where('app_status', 'Pending')->update(['app_status' => 'Pending_ILD']);
        DB::table('applications')->where('app_status', 'Reviewing')->update(['app_status' => 'Pending_Company']);

        // Step 3: Remove old values from ENUM
        DB::statement("ALTER TABLE applications MODIFY app_status ENUM('Pending_ILD', 'Pending_Company', 'Interview_Scheduled', 'Approved', 'Rejected') DEFAULT 'Pending_ILD'");
    }

    public function down()
    {
        // Revert: convert new statuses back to old
        DB::table('applications')->where('app_status', 'Pending_ILD')->update(['app_status' => 'Pending']);
        DB::table('applications')->where('app_status', 'Pending_Company')->update(['app_status' => 'Reviewing']);
        DB::statement("ALTER TABLE applications MODIFY app_status ENUM('Pending', 'Reviewing', 'Approved', 'Rejected') DEFAULT 'Pending'");
    }
};
