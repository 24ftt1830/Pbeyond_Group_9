<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->decimal('component_weight', 5, 2)->default(0)->after('name');
            $table->enum('supervisor_type', ['Academic Supervisor', 'Industry Supervisor', 'Student'])->change();
        });

        Schema::table('evaluation_submissions', function (Blueprint $table) {
            $table->enum('supervisor_type', ['Academic Supervisor', 'Industry Supervisor', 'Student'])->change();
        });

        foreach (DB::table('evaluation_templates')->get() as $template) {
            $weight = DB::table('evaluation_sections')
                ->where('evaluation_template_id', $template->id)
                ->sum('weight');
            DB::table('evaluation_templates')->where('id', $template->id)
                ->update(['component_weight' => $weight]);
        }
    }

    public function down(): void
    {
        Schema::table('evaluation_submissions', function (Blueprint $table) {
            $table->enum('supervisor_type', ['Academic Supervisor', 'Industry Supervisor'])->change();
        });
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->enum('supervisor_type', ['Academic Supervisor', 'Industry Supervisor'])->change();
            $table->dropColumn('component_weight');
        });
    }
};
