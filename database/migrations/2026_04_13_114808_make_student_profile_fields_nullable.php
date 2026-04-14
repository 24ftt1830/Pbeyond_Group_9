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
        Schema::table('students', function (Blueprint $table) {
            $table->string('ic_number')->nullable()->change();
            $table->string('ic_colour')->nullable()->change();
            $table->text('postal_address')->nullable()->change();
            $table->date('date_of_birth')->nullable()->change();
            $table->string('place_of_birth')->nullable()->change();
            $table->string('gender')->nullable()->change();
            $table->string('religion')->nullable()->change();
            $table->string('nationality')->nullable()->change();
            $table->string('race')->nullable()->change();
            $table->string('mobile_phone')->nullable()->change();
            $table->string('emergency_no')->nullable()->change();
            $table->string('intake_session')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('ic_number')->nullable(false)->change();
            $table->string('ic_colour')->nullable(false)->change();
            $table->text('postal_address')->nullable(false)->change();
            $table->date('date_of_birth')->nullable(false)->change();
            $table->string('place_of_birth')->nullable(false)->change();
            $table->string('gender')->nullable(false)->change();
            $table->string('religion')->nullable(false)->change();
            $table->string('nationality')->nullable(false)->change();
            $table->string('race')->nullable(false)->change();
            $table->string('mobile_phone')->nullable(false)->change();
            $table->string('emergency_no')->nullable(false)->change();
            $table->string('intake_session')->nullable(false)->change();
        });
    }
};
