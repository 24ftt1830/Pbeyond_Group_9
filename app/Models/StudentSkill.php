<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentSkill extends Model
{
    protected $table = 'student_skills';
    protected $primaryKey = 'skill_id';
    public $timestamps = false;

    protected $fillable = [
        'student_id', 'skill_name'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
