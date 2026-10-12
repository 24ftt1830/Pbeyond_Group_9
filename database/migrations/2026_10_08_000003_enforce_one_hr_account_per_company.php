<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('users')->where('role', 'Company')->whereNotNull('company_id')
            ->groupBy('company_id')->havingRaw('COUNT(*) > 1')->pluck('company_id');

        if ($duplicates->isNotEmpty()) {
            throw new RuntimeException(
                'Cannot enforce one HR account per company: multiple HR accounts exist for company IDs '
                .$duplicates->implode(', ').'. Resolve these accounts before running this migration. No accounts were deleted.'
            );
        }

        Schema::table('users', function (Blueprint $table) {
            // Other roles, including Industry Supervisors, can share a company.
            $table->unsignedBigInteger('hr_company_id')->nullable()
                ->virtualAs("CASE WHEN role = 'Company' THEN company_id ELSE NULL END");
            $table->unique('hr_company_id', 'users_one_hr_per_company_unique');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_one_hr_per_company_unique');
            $table->dropColumn('hr_company_id');
        });
    }
};
