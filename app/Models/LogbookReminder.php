<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogbookReminder extends Model
{
    protected $fillable = [
        'student_id',
        'week_start',
        'sent_by_user_id',
        'sent_at',
        'acknowledged_at',
    ];

    protected $casts = [
        'week_start' => 'date',
        'sent_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by_user_id', 'user_id');
    }
}
