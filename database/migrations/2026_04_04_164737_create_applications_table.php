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
    if(!Schema::hasTable('applications')) {
	Schema::create('applications', function (Blueprint $table) {
        $table->id();
        
        $table->foreignId('student_id')->constrained('students', 'student_id')->onDelete('cascade');
        $table->foreignId('quota_id')->constrained('placement_quotas', 'quota_id')->onDelete('cascade');
        
        $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
        $table->timestamps();

        // This ensures the combination of student + quota is unique.
        $table->unique(['student_id', 'quota_id']); 
    });
}
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
