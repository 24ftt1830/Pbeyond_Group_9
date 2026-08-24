<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_entries', function (Blueprint $table) {
            if (Schema::hasColumn('logbook_entries', 'title')) {
                $table->dropColumn('title');
            }
            if (Schema::hasColumn('logbook_entries', 'hours_worked')) {
                $table->dropColumn('hours_worked');
            }
            if (Schema::hasColumn('logbook_entries', 'remarks')) {
                $table->dropColumn('remarks');
            }
        });
    }

    public function down(): void
    {
        Schema::table('logbook_entries', function (Blueprint $table) {
            $table->string('title')->nullable();
            $table->integer('hours_worked')->nullable();
            $table->text('remarks')->nullable();
        });
    }
};