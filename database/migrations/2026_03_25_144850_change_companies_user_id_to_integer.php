<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the foreign key (if it exists)
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['user_id']); // This will drop 'companies_user_id_foreign'
        });

        // Change the column to integer (signed) to match users.user_id
        Schema::table('companies', function (Blueprint $table) {
            $table->integer('user_id')->nullable()->change();
        });

        // Re-add the foreign key
        Schema::table('companies', function (Blueprint $table) {
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });
        Schema::table('companies', function (Blueprint $table) {
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }
};
