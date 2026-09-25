<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_supervisor_visits', function (Blueprint $table) {
            $table->id('visit_id');

            $table->unsignedBigInteger('assignment_id');
            $table->date('visit_date');
            $table->text('notes');

            $table->timestamps();

            $table->foreign('assignment_id')
                ->references('assignment_id')
                ->on('academic_supervisor_assignments')
                ->onDelete('restrict');

            $table->index('assignment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_supervisor_visits');
    }
};