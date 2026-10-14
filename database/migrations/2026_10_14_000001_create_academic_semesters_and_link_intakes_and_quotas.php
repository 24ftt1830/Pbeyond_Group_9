<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_semesters', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->date('starts_on');
            $table->date('ends_on');
            $table->timestamps();
            $table->index(['starts_on', 'ends_on']);
        });

        $firstYear = 2018;
        $lastYear = (int) date('Y') + 10;
        for ($year = $firstYear; $year <= $lastYear; $year++) {
            foreach ([
                ["January {$year}", "{$year}-01-01", "{$year}-06-30"],
                ["July {$year}", "{$year}-07-01", "{$year}-12-31"],
            ] as [$name, $startsOn, $endsOn]) {
                DB::table('academic_semesters')->updateOrInsert(
                    ['name' => $name],
                    ['starts_on' => $startsOn, 'ends_on' => $endsOn, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('intake_semester_id')
                ->nullable()
                ->after('intake_session')
                ->constrained('academic_semesters')
                ->nullOnDelete();
        });

        Schema::table('placement_quotas', function (Blueprint $table) {
            $table->foreignId('academic_semester_id')
                ->nullable()
                ->after('company_id')
                ->constrained('academic_semesters')
                ->nullOnDelete();
        });

        $semesterIds = DB::table('academic_semesters')->pluck('id', 'name');
        foreach (DB::table('students')->select('student_id', 'intake_session')->whereNotNull('intake_session')->get() as $student) {
            if (!preg_match('/^(January|Jan|July|Jul)\s+(\d{4})$/i', trim($student->intake_session), $matches)) {
                continue;
            }

            $month = strtolower($matches[1]);
            $name = (str_starts_with($month, 'jan') ? 'January ' : 'July ') . $matches[2];
            if ($semesterIds->has($name)) {
                DB::table('students')->where('student_id', $student->student_id)->update([
                    'intake_session' => $name,
                    'intake_semester_id' => $semesterIds[$name],
                ]);
            }
        }

        $today = date('Y-m-d');
        $currentSemesterId = DB::table('academic_semesters')
            ->whereDate('starts_on', '<=', $today)
            ->whereDate('ends_on', '>=', $today)
            ->value('id');

        if ($currentSemesterId) {
            DB::table('placement_quotas')->whereNull('academic_semester_id')->update([
                'academic_semester_id' => $currentSemesterId,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('placement_quotas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_semester_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropConstrainedForeignId('intake_semester_id');
        });

        Schema::dropIfExists('academic_semesters');
    }
};
