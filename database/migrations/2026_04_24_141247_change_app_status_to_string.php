<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    DB::statement("ALTER TABLE applications MODIFY app_status VARCHAR(255) DEFAULT 'Pending'");
}

public function down(): void
{
    DB::statement("ALTER TABLE applications MODIFY app_status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending'");
}
};
