<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $table = 'students';

    protected $primaryKey = 'student_id';

    public $timestamps = true;

    protected $fillable = [
        'pb_student_code', 'user_id', 'full_name', 'ic_number', 'ic_colour',
        'programme_id', 'intake_session', 'postal_address', 'date_of_birth',
        'place_of_birth', 'gender', 'religion', 'nationality', 'race',
        'mobile_phone', 'cgpa', 'work_experience', 'emergency_no',
        'cv_file_path', 'vetting_status',
        'passport_photo_path',

    ];

    protected $casts = [
        'date_of_birth' => 'date',
        // tbr 'cgpa' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function programme()
    {
        return $this->belongsTo(Programme::class, 'programme_id', 'programme_id');
    }

    public function skills()
    {
        return $this->hasMany(StudentSkill::class, 'student_id', 'student_id');
    }

    public function languages()
    {
        return $this->hasMany(StudentLanguage::class, 'student_id', 'student_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'student_id', 'student_id');
    }

    public function supervisorAssignments()
    {
        return $this->hasMany(SupervisorAssignment::class, 'student_id', 'student_id');
    }

    // Scope for vetted students
    public function scopeVetted($query)
    {
        return $query->where('vetting_status', 'Approved');
    }

    // Scope for pending vetting
    public function scopePendingVetting($query)
    {
        return $query->where('vetting_status', 'Pending');
    }

    public function documents()
    {
        return $this->hasManyThrough(Document::class, User::class, 'user_id', 'user_id', 'user_id', 'user_id');
    }
}
