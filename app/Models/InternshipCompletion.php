<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternshipCompletion extends Model
{
    protected $fillable = [
        'student_id',
        'industry_confirmation_status',
        'industry_supervisor_id',
        'industry_reviewed_at',
        'industry_confirmed_at',
        'academic_completion_status',
        'academic_supervisor_id',
        'academic_completion_decided_at',
        'industry_decided_by_user_id',
        'academic_decided_by_user_id',
    ];

    protected $casts = [
        'industry_reviewed_at' => 'datetime',
        'industry_confirmed_at' => 'datetime',
        'academic_completion_decided_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function industrySupervisor(): BelongsTo
    {
        return $this->belongsTo(IndustrySupervisor::class, 'industry_supervisor_id', 'supervisor_id');
    }

    public function academicSupervisor(): BelongsTo
    {
        return $this->belongsTo(AcademicSupervisor::class, 'academic_supervisor_id', 'academic_supervisor_id');
    }

    public function resetAcademicDecision(): void
    {
        $this->forceFill([
            'academic_completion_status' => 'Pending Evaluation',
            'academic_supervisor_id' => null,
            'academic_decided_by_user_id' => null,
            'academic_completion_decided_at' => null,
        ])->save();
    }
}
