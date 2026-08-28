<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programmes', function (Blueprint $table) {
            $table->unsignedTinyInteger('total_semesters')
                ->default(6)
                ->after('school_id');

            $table->unsignedTinyInteger('internship_semester')
                ->nullable()
                ->after('total_semesters');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->unsignedTinyInteger('current_semester')
                ->default(1)
                ->after('intake_session');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('current_semester');
        });

        Schema::table('programmes', function (Blueprint $table) {
            $table->dropColumn([
                'total_semesters',
                'internship_semester',
            ]);
        });
    }
};