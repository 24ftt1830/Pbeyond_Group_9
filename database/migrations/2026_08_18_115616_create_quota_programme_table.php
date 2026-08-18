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
        Schema::create('quota_programme', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('quota_id');
            $table->unsignedBigInteger('programme_id');

            $table->foreign('quota_id')
                ->references('quota_id')
                ->on('placement_quotas')
                ->onDelete('cascade');

            $table->foreign('programme_id')
                ->references('programme_id')
                ->on('programmes')
                ->onDelete('cascade');

            $table->unique(['quota_id', 'programme_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quota_programme');
    }
};