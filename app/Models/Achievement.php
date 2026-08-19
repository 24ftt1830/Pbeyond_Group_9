<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{
    protected $fillable = [
        'student_id',
        'title',
        'description',
        'issuer',
        'achievement_date',
        'active',
    ];

    protected $casts = [
        'achievement_date' => 'date',
        'active' => 'boolean',
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