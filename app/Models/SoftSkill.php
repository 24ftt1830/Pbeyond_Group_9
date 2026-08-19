<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SoftSkill extends Model
{
    protected $fillable = [
        'student_id',
        'skill',
        'description',
        'active',
    ];

    protected $casts = [
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