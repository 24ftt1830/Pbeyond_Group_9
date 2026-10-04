<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programmes', function (Blueprint $table) {
            $table->unsignedBigInteger('class_id')->nullable()->unique()->after('programme_id');
        });

        DB::table('programmes')->orderBy('programme_id')->each(function ($programme) {
            DB::table('programmes')
                ->where('programme_id', $programme->programme_id)
                ->update(['class_id' => $programme->programme_id]);
        });
    }

    public function down(): void
    {
        Schema::table('programmes', function (Blueprint $table) {
            $table->dropUnique(['class_id']);
            $table->dropColumn('class_id');
        });
    }
};
