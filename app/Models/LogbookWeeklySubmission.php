<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogbookWeeklySubmission extends Model
{
    protected $fillable = [
        'student_id',
        'week_start',
        'week_end',
        'status',
        'supervisor_feedback',
        'flagged_entries',
        'submitted_at',
        'reviewed_at',
        'date_change_review_required',
        'date_change_reviewed_at',
        'date_change_reviewer_user_id',
    ];

    protected $casts = [
        'flagged_entries' => 'array',
        'week_start' => 'date',
        'week_end' => 'date',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'date_change_review_required' => 'boolean',
        'date_change_reviewed_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(
            Student::class,
            'student_id',
            'student_id'
        );
    }
}
