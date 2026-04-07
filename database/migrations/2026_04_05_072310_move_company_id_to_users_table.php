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
    Schema::table('users', function (Blueprint $table) {

        $table->integer('company_id')->nullable()->after('role');

        $table->foreign('company_id')
              ->references('company_id')
              ->on('companies')
              ->onDelete('set null');
    });

    Schema::table('companies', function (Blueprint $table) {
        if (Schema::hasColumn('companies', 'user_id')) {
            $table->dropForeign(['user_id']);
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
