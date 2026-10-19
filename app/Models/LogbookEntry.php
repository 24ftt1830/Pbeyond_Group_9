<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogbookEntry extends Model
{
    protected $fillable = [
        'student_id',
        'date',
        'status',
        'description',
        'learning_outcomes',
        'issues',
        'attachments',
        'legacy_permission',
    ];

    protected $casts = [
        'date' => 'date',
        'attachments' => 'array',
        'legacy_permission' => 'boolean',
    ];

    protected $hidden = ['attachments'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
