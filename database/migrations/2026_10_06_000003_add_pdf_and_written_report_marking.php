<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('final_internship_reports', function (Blueprint $table) {
            $table->string('pdf_path')->nullable()->after('body');
            $table->decimal('report_score', 5, 2)->nullable()->after('academic_review_status');
            $table->decimal('report_component_weight_snapshot', 5, 2)->nullable()->after('report_score');
        });

        Schema::create('evaluation_components', function (Blueprint $table) {
            $table->id();
            $table->string('component_key')->unique();
            $table->string('name');
            $table->decimal('weight', 5, 2)->default(0);
            $table->decimal('active_weight', 5, 2)->default(0);
            $table->timestamps();
        });

        $previousStudentWeight = DB::table('evaluation_templates')
            ->where('supervisor_type', 'Student')
            ->orderByDesc('version')
            ->value('component_weight') ?? 0;

        DB::table('evaluation_templates')
            ->where('supervisor_type', 'Student')
            ->update(['is_active' => false]);

        DB::table('evaluation_components')->insert([
            'component_key' => 'student_written_report',
            'name' => 'Student Written Report',
            'weight' => $previousStudentWeight,
            'active_weight' => $previousStudentWeight,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_components');
        Schema::table('final_internship_reports', function (Blueprint $table) {
            $table->dropColumn(['pdf_path', 'report_score', 'report_component_weight_snapshot']);
        });
    }
};
