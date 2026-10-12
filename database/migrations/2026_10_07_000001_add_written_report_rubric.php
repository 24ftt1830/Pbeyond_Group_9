<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->enum('supervisor_type', [
                'Academic Supervisor',
                'Industry Supervisor',
                'Student',
                'Written Report',
            ])->change();
        });

        Schema::table('final_internship_reports', function (Blueprint $table) {
            $table->foreignId('report_template_id')
                ->nullable()
                ->after('report_score')
                ->constrained('evaluation_templates')
                ->restrictOnDelete();
            $table->unsignedInteger('report_template_version')->nullable()->after('report_template_id');
            $table->json('report_template_snapshot')->nullable()->after('report_template_version');
            $table->json('report_answers')->nullable()->after('report_template_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('final_internship_reports', function (Blueprint $table) {
            $table->dropForeign(['report_template_id']);
            $table->dropColumn([
                'report_template_id',
                'report_template_version',
                'report_template_snapshot',
                'report_answers',
            ]);
        });

        DB::table('evaluation_templates')->where('supervisor_type', 'Written Report')->delete();

        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->enum('supervisor_type', [
                'Academic Supervisor',
                'Industry Supervisor',
                'Student',
            ])->change();
        });
    }
};
