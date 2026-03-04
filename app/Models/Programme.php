<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    protected $table = 'programmes';
    protected $primaryKey = 'programme_id';
    public $timestamps = false;

    protected $fillable = [
        'programme_name', 'school_id'
    ];

    // THIS RELATIONSHIP WAS MISSING!
    public function school()
    {
        return $this->belongsTo(School::class, 'school_id', 'school_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'programme_id', 'programme_id');
    }

    public function placementQuotas()
    {
        return $this->hasMany(PlacementQuota::class, 'programme_id', 'programme_id');
    }
}
