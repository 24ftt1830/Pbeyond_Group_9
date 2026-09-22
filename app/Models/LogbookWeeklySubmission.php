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
    ];

    protected $casts = [
        'flagged_entries' => 'array',
        'week_start' => 'date',
        'week_end' => 'date',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
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