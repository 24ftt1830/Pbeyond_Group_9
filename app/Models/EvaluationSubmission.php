<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationSubmission extends Model
{
    protected $fillable = [
        'evaluation_template_id', 'template_version', 'student_id', 'supervisor_type',
        'academic_supervisor_id', 'industry_supervisor_id', 'template_snapshot',
        'answers', 'overall_score', 'comments', 'submitted_at', 'reopened_at', 'reopened_by_user_id',
    ];

    protected $casts = [
        'template_snapshot' => 'array',
        'answers' => 'array',
        'submitted_at' => 'datetime',
        'reopened_at' => 'datetime',
        'overall_score' => 'decimal:2',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(EvaluationTemplate::class, 'evaluation_template_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
