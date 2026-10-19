<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('district', 40)->nullable();
            $table->string('emergency_no_2', 20)->nullable();
            $table->string('insurance_document_path')->nullable();
        });

        DB::table('academic_semesters')->orderBy('id')->get()->each(function ($semester) {
            if (!preg_match('/^(January|July) (\d{4})$/', $semester->name, $matches)) {
                return;
            }
            $year = (int) $matches[2];
            $july = $matches[1] === 'July';
            $intake = $year - ($july ? 2010 : 2011);
            $name = $semester->name . ' · Intake ' . $intake . ($july ? ' (First half)' : ' (Second half)');
            DB::table('academic_semesters')->where('id', $semester->id)->update(['name' => $name]);
            DB::table('students')->where('intake_semester_id', $semester->id)->update(['intake_session' => $name]);
        });
    }

    public function down(): void
    {
        DB::table('academic_semesters')->orderBy('id')->get()->each(function ($semester) {
            if (preg_match('/^((?:January|July) \d{4}) · Intake \d+ \((?:First|Second) half\)$/', $semester->name, $matches)) {
                DB::table('academic_semesters')->where('id', $semester->id)->update(['name' => $matches[1]]);
                DB::table('students')->where('intake_semester_id', $semester->id)->update(['intake_session' => $matches[1]]);
            }
        });
        Schema::table('students', fn (Blueprint $table) => $table->dropColumn(['district', 'emergency_no_2', 'insurance_document_path']));
    }
};
