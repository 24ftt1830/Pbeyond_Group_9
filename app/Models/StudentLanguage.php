<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentLanguage extends Model
{
    protected $table = 'student_languages';
    protected $primaryKey = 'language_id';
    public $timestamps = false;

    protected $fillable = [
        'student_id', 'language_name'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }
}
