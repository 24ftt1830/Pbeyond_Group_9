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
        Schema::table('placement_quotas', function (Blueprint $table) {
            $table->dateTime('application_deadline')->nullable()->after('interview_required');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::table('placement_quotas', function (Blueprint $table) {
        $table->dropColumn('application_deadline');
    });
}
};
