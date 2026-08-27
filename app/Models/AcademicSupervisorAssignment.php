<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicSupervisorAssignment extends Model
{
    protected $table = 'academic_supervisor_assignments';

    protected $primaryKey = 'assignment_id';

    protected $fillable = [
        'academic_supervisor_id',
        'student_id',
    ];

    public function academicSupervisor(): BelongsTo
    {
        return $this->belongsTo(
            AcademicSupervisor::class,
            'academic_supervisor_id',
            'academic_supervisor_id'
        );
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(
            Student::class,
            'student_id',
            'student_id'
        );
    }
}