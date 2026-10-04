<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IndustrySupervisor extends Model
{
    protected $table = 'industry_supervisors';

    protected $primaryKey = 'supervisor_id';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'company_id',
        'quota_id',
        'full_name',
        'email',
        'phone',
        'position',
    ];

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id',
            'user_id'
        );
    }

    public function company()
    {
        return $this->belongsTo(
            Company::class,
            'company_id',
            'company_id'
        );
    }

    public function quota()
    {
        return $this->belongsTo(
            PlacementQuota::class,
            'quota_id',
            'quota_id'
        );
    }

    public function applications()
    {
        return $this->hasMany(
            Application::class,
            'quota_id',
            'quota_id'
        );
    }

    public function assignments()
    {
        return $this->hasMany(
            SupervisorAssignment::class,
            'supervisor_id',
            'supervisor_id'
        );
    }

    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'supervisor_assignments',
            'supervisor_id',
            'student_id'
        );
    }
}
