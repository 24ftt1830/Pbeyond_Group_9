<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Drop the existing foreign key (name may be 'companies_ibfk_1' or 'companies_user_id_foreign')
            // Let's try to drop it using the actual name from error: 'companies_ibfk_1'
            $table->dropForeign('companies_ibfk_1');
        });

        Schema::table('companies', function (Blueprint $table) {
            // Now alter the column to nullable
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });

        Schema::table('companies', function (Blueprint $table) {
            // Re-add the foreign key (this time it will reference the same column, now nullable)
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign('companies_user_id_foreign');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }
};
