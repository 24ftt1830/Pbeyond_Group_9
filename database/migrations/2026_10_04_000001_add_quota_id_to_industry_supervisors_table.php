<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('industry_supervisors', function (Blueprint $table) {
            $table->unsignedBigInteger('quota_id')->nullable()->after('company_id');
            $table->foreign('quota_id')
                ->references('quota_id')
                ->on('placement_quotas')
                ->nullOnDelete();
            $table->index('quota_id');
        });

        // Preserve existing associations where the old position text exactly
        // matches one of the company's quota job titles.
        DB::table('industry_supervisors')
            ->whereNotNull('position')
            ->orderBy('supervisor_id')
            ->get(['supervisor_id', 'company_id', 'position'])
            ->each(function ($supervisor) {
                $quotaId = DB::table('placement_quotas')
                    ->where('company_id', $supervisor->company_id)
                    ->where('job_title', $supervisor->position)
                    ->value('quota_id');

                if ($quotaId) {
                    DB::table('industry_supervisors')
                        ->where('supervisor_id', $supervisor->supervisor_id)
                        ->update(['quota_id' => $quotaId]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('industry_supervisors', function (Blueprint $table) {
            $table->dropForeign(['quota_id']);
            $table->dropIndex(['quota_id']);
            $table->dropColumn('quota_id');
        });
    }
};
