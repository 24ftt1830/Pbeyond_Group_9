<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('placement_quotas', function (Blueprint $table) {
            $table->timestamp('auto_rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
        });
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::table('placement_quotas', function (Blueprint $table) {
            $table->dropColumn(['auto_rejected_at', 'rejection_reason']);
        });
    }
};
