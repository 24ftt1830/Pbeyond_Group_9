<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_entries', function (Blueprint $table) {
            $table->dropColumn([
                'title',
                'hours_worked',
                'remarks',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('logbook_entries', function (Blueprint $table) {
            $table->string('title')->nullable();
            $table->decimal('hours_worked', 5, 2)->nullable();
            $table->text('remarks')->nullable();
        });
    }
};