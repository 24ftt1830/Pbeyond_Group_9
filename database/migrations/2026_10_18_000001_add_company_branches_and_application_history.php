<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('district', 40)->nullable();
        });
        Schema::create('company_branches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->foreign('company_id')->references('company_id')->on('companies')->cascadeOnDelete();
            $table->string('name', 150);
            $table->text('address')->nullable();
            $table->string('district', 40)->nullable();
            $table->timestamps();
        });
        Schema::create('company_branch_placement_quota', function (Blueprint $table) {
            $table->foreignId('company_branch_id')->constrained('company_branches')->cascadeOnDelete();
            $table->unsignedBigInteger('quota_id');
            $table->foreign('quota_id')->references('quota_id')->on('placement_quotas')->cascadeOnDelete();
            $table->primary(['company_branch_id', 'quota_id']);
        });
        Schema::table('applications', function (Blueprint $table) {
            $table->foreignId('company_branch_id')->nullable()->constrained('company_branches')->restrictOnDelete();
            $table->index(['student_id', 'app_status']);
        });
        Schema::table('applications', fn (Blueprint $table) => $table->dropUnique(['student_id', 'quota_id']));
        Schema::create('application_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->unsignedBigInteger('changed_by_user_id')->nullable();
            $table->foreign('changed_by_user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['application_id', 'created_at']);
        });

        DB::table('companies')->orderBy('company_id')->each(function ($company) {
            $address = $company->office_address ?? '';
            $district = null;
            foreach (['Belait', 'Tutong', 'Temburong'] as $candidate) {
                if (stripos($address, $candidate) !== false) {
                    $district = $candidate;
                    break;
                }
            }
            if (!$district && preg_match('/muara|bandar seri begawan/i', $address)) {
                $district = 'Brunei-Muara';
            }
            $branchId = DB::table('company_branches')->insertGetId([
                'company_id' => $company->company_id, 'name' => 'Main Branch',
                'address' => $address ?: null, 'district' => $district,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('companies')->where('company_id', $company->company_id)->update(['district' => $district]);
            $quotaIds = DB::table('placement_quotas')->where('company_id', $company->company_id)->pluck('quota_id');
            foreach ($quotaIds as $quotaId) {
                DB::table('company_branch_placement_quota')->insert(['company_branch_id' => $branchId, 'quota_id' => $quotaId]);
            }
            DB::table('applications')->whereIn('quota_id', $quotaIds)->update(['company_branch_id' => $branchId]);
        }, 100);
        DB::table('applications')->orderBy('id')->each(function ($application) {
            DB::table('application_status_histories')->insert([
                'application_id' => $application->id, 'from_status' => null, 'to_status' => $application->app_status,
                'changed_by_user_id' => null,
                'created_at' => $application->updated_at ?? $application->created_at ?? now(),
            ]);
        }, 200);
    }

    public function down(): void
    {
        Schema::dropIfExists('application_status_histories');
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['company_branch_id']);
            $table->dropColumn('company_branch_id');
            $table->dropIndex(['student_id', 'app_status']);
        });
        Schema::dropIfExists('company_branch_placement_quota');
        Schema::dropIfExists('company_branches');
        Schema::table('companies', fn (Blueprint $table) => $table->dropColumn('district'));
        // Repeat applications are retained; restoring the legacy unique index would discard history.
    }
};
