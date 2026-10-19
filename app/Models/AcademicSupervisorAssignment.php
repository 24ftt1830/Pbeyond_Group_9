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
        'student_id',
        'class_id',
        'monitoring_status',
    ];

    protected static function booted(): void
    {
        // Original class assignments remain in storage for historical visits.
        // Active supervision always belongs to an individual student.
        static::addGlobalScope('individual_student', fn ($query) => $query->whereNotNull('academic_supervisor_assignments.student_id'));
    }

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

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
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
