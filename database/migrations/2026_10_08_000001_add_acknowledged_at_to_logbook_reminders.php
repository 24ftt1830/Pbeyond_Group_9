<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_reminders', function (Blueprint $table) {
            $table->timestamp('acknowledged_at')->nullable()->after('sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('logbook_reminders', function (Blueprint $table) {
            $table->dropColumn('acknowledged_at');
        });
    }
};
