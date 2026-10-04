<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    protected $table = 'programmes';

    protected $primaryKey = 'programme_id';

    public $timestamps = false;

   protected $fillable = [
    'programme_name',
    'class_id',
    'school_id',
    'total_semesters',
    ];

    public function school()
    {
        return $this->belongsTo(
            School::class,
            'school_id',
            'school_id'
        );
    }

    public function students()
    {
        return $this->hasMany(
            Student::class,
            'programme_id',
            'programme_id'
        );
    }

    public function academicSupervisorAssignments()
    {
        return $this->hasMany(
            AcademicSupervisorAssignment::class,
            'class_id',
            'class_id'
        );
    }

    // NEW relationship:
    // One programme can belong to many placement quotas.
    public function placementQuotas()
    {
        return $this->belongsToMany(
            PlacementQuota::class,
            'quota_programme',
            'programme_id',
            'quota_id',
            'programme_id',
            'quota_id'
        )->withTimestamps();
    }
}
