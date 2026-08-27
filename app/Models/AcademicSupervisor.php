<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicSupervisor extends Model
{
    protected $table = 'academic_supervisors';

    protected $primaryKey = 'academic_supervisor_id';

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'phone',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id',
            'user_id'
        );
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(
            AcademicSupervisorAssignment::class,
            'academic_supervisor_id',
            'academic_supervisor_id'
        );
    }
}