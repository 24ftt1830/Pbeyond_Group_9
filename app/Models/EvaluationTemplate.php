<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationTemplate extends Model
{
    protected $fillable = ['supervisor_type', 'name', 'component_weight', 'version', 'is_active'];
    protected $casts = ['is_active' => 'boolean', 'component_weight' => 'decimal:2'];

    public function sections(): HasMany
    {
        return $this->hasMany(EvaluationSection::class)->orderBy('sort_order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(EvaluationSubmission::class);
    }
}
