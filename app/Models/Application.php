<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    public const ACTIVE_STATUSES = ['Pending', 'Interviewing', 'Waitlisted', 'Recruited', 'Approved', 'Pending_ILD', 'Pending_Company', 'Interview_Scheduled'];
    protected $table = 'applications';
    // public $timestamps = false;

    protected $fillable = [
        'student_id', 
        'quota_id', 
        'company_branch_id',
        'apply_date',
        'app_status', 
        'interview_date', // ADDED HERE
        'company_feedback',
        'cv_snapshot',
        'cv_snapshot_updated_at',
        'cv_revision',
    ];

    protected $casts = [
        'apply_date' => 'datetime',
        'interview_date' => 'datetime', // ADDED HERE
        'cv_snapshot' => 'array',
        'cv_snapshot_updated_at' => 'datetime',
        'cv_revision' => 'integer',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function branch()
    {
        return $this->belongsTo(CompanyBranch::class, 'company_branch_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(ApplicationStatusHistory::class)->orderBy('created_at')->orderBy('id');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('app_status', self::ACTIVE_STATUSES);
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
        return $this->quota();
    }
}
