<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Education;
use App\Models\ProfessionalProfile;
use App\Models\Project;
use App\Models\Activity;
use App\Models\Achievement;
use App\Models\Referee;
use App\Models\SoftSkill;
use App\Models\WorkExperience;
use App\Models\StudentSkill;
use App\Models\StudentLanguage;
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

    public function education()
    {
        return $this->hasMany(
            Education::class,
            'student_id',
            'student_id'
        );
    }

    public function professionalProfile()
    {
        return $this->hasOne(
            ProfessionalProfile::class,
            'student_id',
            'student_id'
        );
    }

    public function projects()
    {
        return $this->hasMany(
            Project::class,
            'student_id',
            'student_id'
        );
    }

    public function activities()
    {
        return $this->hasMany(
            Activity::class,
            'student_id',
            'student_id'
        );
    }

    public function achievements()
    {
        return $this->hasMany(
            Achievement::class,
            'student_id',
            'student_id'
        );
    }

    public function referees()
    {
        return $this->hasMany(
            Referee::class,
            'student_id',
            'student_id'
        );
    }

    public function softSkills()
    {
        return $this->hasMany(
            SoftSkill::class,
            'student_id',
            'student_id'
        );
    }

    public function workExperiences()
    {
        return $this->hasMany(
            WorkExperience::class,
            'student_id',
            'student_id'
        );
    }
}
