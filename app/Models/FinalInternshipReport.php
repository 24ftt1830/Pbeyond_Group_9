<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinalInternshipReport extends Model
{
    protected $fillable = [
        'student_id', 'title', 'body', 'submitted_at',
        'pdf_path', 'academic_review_status', 'report_score', 'report_component_weight_snapshot',
        'report_template_id', 'report_template_version', 'report_template_snapshot', 'report_answers',
        'academic_review_comments', 'academic_reviewed_at',
        'reopened_at', 'reopened_by_user_id',
        'industry_confirmation_status', 'industry_confirmation_comments', 'industry_confirmed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'academic_reviewed_at' => 'datetime',
        'reopened_at' => 'datetime',
        'industry_confirmed_at' => 'datetime',
        'report_score' => 'decimal:2',
        'report_component_weight_snapshot' => 'decimal:2',
        'report_template_snapshot' => 'array',
        'report_answers' => 'array',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function reportTemplate(): BelongsTo
    {
        return $this->belongsTo(EvaluationTemplate::class, 'report_template_id');
    }
}
