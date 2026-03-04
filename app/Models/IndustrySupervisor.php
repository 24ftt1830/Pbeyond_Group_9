<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IndustrySupervisor extends Model
{
    protected $table = 'industry_supervisors';
    protected $primaryKey = 'supervisor_id';
    public $timestamps = false;

    protected $fillable = [
        'company_id', 'full_name', 'email', 'phone', 'position'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'company_id');
    }

    public function assignments()
    {
        return $this->hasMany(SupervisorAssignment::class, 'supervisor_id', 'supervisor_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'supervisor_assignments',
                                    'supervisor_id', 'student_id');
    }
}
