<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationRatingLevel extends Model
{
    protected $fillable = ['evaluation_criterion_id', 'title', 'description', 'points', 'sort_order'];
}
