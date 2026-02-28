<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupervisorAssignment extends Model
{
    protected $table = 'supervisor_assignments';
    protected $primaryKey = 'assignment_id';
    public $timestamps = true;

    protected $fillable = [
        'supervisor_id', 'student_id'
    ];

    public function supervisor()
    {
        return $this->belongsTo(IndustrySupervisor::class, 'supervisor_id', 'supervisor_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
