<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('evaluation_sections', function (Blueprint $table) {
            $table->decimal('weight', 5, 2)->nullable()->change();
        });

        Schema::table('evaluation_rating_levels', function (Blueprint $table) {
            $table->unsignedSmallInteger('points')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Keep these columns nullable so previously saved incomplete drafts remain valid.
    }
};
