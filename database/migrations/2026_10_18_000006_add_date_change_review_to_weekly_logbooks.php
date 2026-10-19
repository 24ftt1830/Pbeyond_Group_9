<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->boolean('date_change_review_required')->default(false);
            $table->timestamp('date_change_reviewed_at')->nullable();
            $table->unsignedBigInteger('date_change_reviewer_user_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('logbook_weekly_submissions', function (Blueprint $table) {
            $table->dropColumn([
                'date_change_review_required',
                'date_change_reviewed_at',
                'date_change_reviewer_user_id',
            ]);
        });
    }
};
