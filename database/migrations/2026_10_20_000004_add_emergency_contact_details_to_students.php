<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('emergency_contact_name', 150)->nullable();
            $table->string('emergency_contact_relationship', 100)->nullable();
            $table->string('emergency_contact_name_2', 150)->nullable();
            $table->string('emergency_contact_relationship_2', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'emergency_contact_name', 'emergency_contact_relationship',
                'emergency_contact_name_2', 'emergency_contact_relationship_2',
            ]);
        });
    }
};
