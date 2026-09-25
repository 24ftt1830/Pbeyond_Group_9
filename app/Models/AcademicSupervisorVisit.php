<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicSupervisorVisit extends Model
{
    protected $table = 'academic_supervisor_visits';

    protected $primaryKey = 'visit_id';

    protected $fillable = [
        'assignment_id',
        'visit_date',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'date',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(
            AcademicSupervisorAssignment::class,
            'assignment_id',
            'assignment_id'
        );
    }
}