<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfessionalProfile extends Model
{
    protected $table = 'professional_profile';

    protected $fillable = [
        'student_id',
        'profile',
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