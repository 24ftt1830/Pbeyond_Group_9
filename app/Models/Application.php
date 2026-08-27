<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $table = 'applications';
    // public $timestamps = false;

    protected $fillable = [
        'student_id', 
        'quota_id', 
        'apply_date',
        'app_status', 
        'interview_date', // ADDED HERE
        'company_feedback'
    ];

    protected $casts = [
        'apply_date' => 'datetime',
        'interview_date' => 'datetime', // ADDED HERE
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function quota()
    {
        return $this->belongsTo(PlacementQuota::class, 'quota_id', 'quota_id');
    }

    // Scope for pending applications
    public function scopePending($query)
    {
        return $query->where('app_status', 'Pending');
    }

    // Scope for approved applications
    public function scopeApproved($query)
    {
        return $query->where('app_status', 'Approved');
    }

    public function placementQuota()
    {
        return $this->belongsTo(PlacementQuota::class, 'placement_quota_id');
    }
}