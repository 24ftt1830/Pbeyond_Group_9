<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
//     public function up()
// {
//     Schema::table('users', function (Blueprint $table) {
//         $table->unsignedBigInteger('company_id')->nullable()->after('role');
//         $table->foreign('company_id')->references('company_id')->on('companies')->onDelete('set null');
//     });

//     Schema::table('companies', function (Blueprint $table) {
//         $table->dropForeign(['user_id']);
//         $table->dropColumn('user_id');
//     });
// }

public function up()
{
    // 1. Add company_id to users
    Schema::table('users', function (Blueprint $table) {
        if (!Schema::hasColumn('users', 'company_id')) {
            // Using foreignId (unsignedBigInteger) to ensure type compatibility
            $table->foreignId('company_id')
                  ->nullable()
                  ->after('role')
                  ->constrained('companies', 'company_id') // Explicitly referencing the column
                  ->onDelete('set null');
        }
    });

    // 2. Cleanup user_id from companies
    Schema::table('companies', function (Blueprint $table) {
        if (Schema::hasColumn('companies', 'user_id')) {
            $table->dropForeign(['user_id']); // This might fail if the foreign key name is custom
            $table->dropColumn('user_id');
        }
    });
}

public function down(): void
{
    Schema::table('companies', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id')->nullable()->after('company_id');
        $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
    });

    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['company_id']);
        $table->dropColumn('company_id');
    });
}
};
