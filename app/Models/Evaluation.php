<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'student_id',
        'industry_supervisor_id',
        'attendance_punctuality',
        'work_quality',
        'technical_skills',
        'communication_skills',
        'teamwork',
        'initiative',
        'professionalism',
        'strengths',
        'areas_for_improvement',
        'comments',
        'recommendation',
        'evaluated_at',
    ];

    protected $casts = [
        'attendance_punctuality' => 'integer',
        'work_quality' => 'integer',
        'technical_skills' => 'integer',
        'communication_skills' => 'integer',
        'teamwork' => 'integer',
        'initiative' => 'integer',
        'professionalism' => 'integer',
        'evaluated_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function industrySupervisor()
    {
        return $this->belongsTo(IndustrySupervisor::class, 'industry_supervisor_id', 'supervisor_id');
    }

    /**
     * Average of the seven rubric scores, rounded to 1 decimal place.
     */
    public function getOverallScoreAttribute(): float
    {
        $scores = [
            $this->attendance_punctuality,
            $this->work_quality,
            $this->technical_skills,
            $this->communication_skills,
            $this->teamwork,
            $this->initiative,
            $this->professionalism,
        ];

        return round(array_sum($scores) / count($scores), 1);
    }
}