<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('student_access_released_at')->nullable();
            $table->timestamp('student_password_set_at')->nullable();
            $table->timestamp('student_invitation_sent_at')->nullable();
            $table->string('student_invitation_status', 20)->default('not_invited')->index();
            $table->uuid('student_invitation_attempt_id')->nullable();
            $table->string('student_invitation_error')->nullable();
        });

        // Preserve access for accounts that existed before invitations were introduced.
        DB::table('users')->where('role', 'Student')->update([
            'student_access_released_at' => now(),
            'student_password_set_at' => now(),
            'student_invitation_status' => 'active',
        ]);

        Schema::create('student_invitation_tokens', function (Blueprint $table) {
            $table->string('email', 150)->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_invitation_tokens');
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['student_invitation_status']);
            $table->dropColumn([
                'student_access_released_at', 'student_password_set_at', 'student_invitation_sent_at',
                'student_invitation_status', 'student_invitation_attempt_id', 'student_invitation_error',
            ]);
        });
    }
};
