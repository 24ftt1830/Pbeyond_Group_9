<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_entries', function (Blueprint $table) {
            $table->string('status', 30)->change();
            $table->json('attachments')->nullable();
            $table->boolean('legacy_permission')->default(false);
        });
        // Preserve old off-day entries and their reviews without requiring retrospective evidence.
        DB::table('logbook_entries')->where('status', 'off')->update([
            'status' => 'permission', 'legacy_permission' => true,
        ]);
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->unsignedBigInteger('reviewer_user_id')->nullable();
            $table->string('reviewer_role', 40)->nullable();
        });
    }

    public function down(): void
    {
        DB::table('logbook_entries')->whereIn('status', ['permission', 'absent', 'holiday'])->update(['status' => 'off']);
        Schema::table('logbook_entries', function (Blueprint $table) {
            $table->dropColumn(['attachments', 'legacy_permission']);
        });
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->dropColumn(['reviewer_user_id', 'reviewer_role']);
        });
    }
};
