<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_entries', function (Blueprint $table) {
            $table->text('learning_outcomes')
                ->nullable()
                ->after('description');

            $table->text('issues')
                ->nullable()
                ->after('learning_outcomes');
        });
    }

    public function down(): void
    {
        Schema::table('logbook_entries', function (Blueprint $table) {
            $table->dropColumn([
                'learning_outcomes',
                'issues',
            ]);
        });
    }
};