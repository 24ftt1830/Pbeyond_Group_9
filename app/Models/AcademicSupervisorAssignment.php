<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicSupervisorAssignment extends Model
{
    protected $table = 'academic_supervisor_assignments';

    protected $primaryKey = 'assignment_id';

    protected $fillable = [
        'academic_supervisor_id',
        'class_id',
        'monitoring_status',
    ];

    public function academicSupervisor(): BelongsTo
    {
        return $this->belongsTo(
            AcademicSupervisor::class,
            'academic_supervisor_id',
            'academic_supervisor_id'
        );
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(
            Programme::class,
            'class_id',
            'class_id'
        );
    }
    
    public function visits(): HasMany
    {
        return $this->hasMany(
            AcademicSupervisorVisit::class,
            'assignment_id',
            'assignment_id'
        );
    }
}
