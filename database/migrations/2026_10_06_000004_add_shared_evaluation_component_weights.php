<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $components = [
            'academic_supervisor' => ['Academic Supervisor', 'Academic Supervisor'],
            'industry_supervisor' => ['Industry Supervisor', 'Industry Supervisor'],
        ];

        foreach ($components as $key => [$name, $supervisorType]) {
            $draftWeight = DB::table('evaluation_templates')->where('supervisor_type', $supervisorType)
                ->orderByDesc('version')->value('component_weight') ?? 0;
            $activeWeight = DB::table('evaluation_templates')->where('supervisor_type', $supervisorType)
                ->where('is_active', true)->orderByDesc('version')->value('component_weight') ?? $draftWeight;

            DB::table('evaluation_components')->updateOrInsert(
                ['component_key' => $key],
                ['name' => $name, 'weight' => $draftWeight, 'active_weight' => $activeWeight, 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    public function down(): void
    {
        DB::table('evaluation_components')->whereIn('component_key', ['academic_supervisor', 'industry_supervisor'])->delete();
    }
};
