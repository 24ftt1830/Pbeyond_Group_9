<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $earlierIds = DB::table('academic_semesters')
                ->where('starts_on', '<', '2024-07-01')
                ->pluck('id');

            if (DB::table('students')->whereIn('intake_semester_id', $earlierIds)->exists()
                || DB::table('placement_quotas')->whereIn('academic_semester_id', $earlierIds)->exists()) {
                throw new RuntimeException('Earlier semesters still have linked students or quotas. Reassign those records before removing the semesters.');
            }

            DB::table('academic_semesters')->whereIn('id', $earlierIds)->delete();

            foreach (DB::table('academic_semesters')->orderBy('id')->get() as $semester) {
                $name = preg_replace('/ \((?:First|Second) half\)$/i', '', $semester->name);

                if ($name !== $semester->name) {
                    DB::table('academic_semesters')->where('id', $semester->id)->update(['name' => $name]);
                }

                DB::table('students')->where('intake_semester_id', $semester->id)->update(['intake_session' => $name]);
            }
        });
    }

    public function down(): void
    {
        // Removed historical semesters are not recreated when rolling back.
        DB::transaction(function () {
            foreach (DB::table('academic_semesters')->orderBy('id')->get() as $semester) {
                if (! preg_match('/^(January|July) \d{4} · Intake \d+$/u', $semester->name, $matches)) {
                    continue;
                }

                $name = $semester->name . ($matches[1] === 'July' ? ' (First half)' : ' (Second half)');
                DB::table('academic_semesters')->where('id', $semester->id)->update(['name' => $name]);
                DB::table('students')->where('intake_semester_id', $semester->id)->update(['intake_session' => $name]);
            }
        });
    }
};
