<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationComponent extends Model
{
    protected $fillable = ['component_key', 'name', 'weight', 'active_weight'];

    protected $casts = ['weight' => 'decimal:2', 'active_weight' => 'decimal:2'];
}
