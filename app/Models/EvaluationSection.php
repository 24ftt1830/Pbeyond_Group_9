<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationSection extends Model
{
    protected $fillable = ['evaluation_template_id', 'title', 'description', 'weight', 'sort_order'];

    public function criteria(): HasMany
    {
        return $this->hasMany(EvaluationCriterion::class)->orderBy('sort_order');
    }
}
