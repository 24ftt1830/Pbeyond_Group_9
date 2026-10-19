<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->json('cv_snapshot')->nullable();
            $table->timestamp('cv_snapshot_updated_at')->nullable();
            $table->unsignedInteger('cv_revision')->default(1);
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['cv_snapshot', 'cv_snapshot_updated_at', 'cv_revision']);
        });
    }
};
