<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PlacementQuota extends Model
{
    protected $table = 'placement_quotas';

    protected $primaryKey = 'quota_id';

    public $timestamps = true;

    protected $fillable = [
        'company_id',
        'academic_semester_id',
        'programme_id',
        'job_title',
        'job_description',
        'skills',
        'total_slots',
        'min_cgpa',
        'quota_status',
        'is_released',
        'interview_required',
    ];

    protected $casts = [
        'skills' => 'array',
        'is_released' => 'boolean',
        'min_cgpa' => 'decimal:2',
        'interview_required' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($quota) {
            $base = Str::slug($quota->job_title) ?: 'position';
            $slug = $base;
            for ($suffix = 2; static::where('slug', $slug)->exists(); $suffix++) {
                $slug = $base . '-' . $suffix;
            }
            $quota->slug = $slug;
        });
    }

    // Slug for route binding
    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function company()
    {
        return $this->belongsTo(
            Company::class,
            'company_id',
            'company_id'
        );
    }

    public function academicSemester()
    {
        return $this->belongsTo(AcademicSemester::class, 'academic_semester_id');
    }

    // OLD relationship - kept temporarily
    public function programme()
    {
        return $this->belongsTo(
            Programme::class,
            'programme_id',
            'programme_id'
        );
    }

    // NEW relationship:
    // One quota can have multiple programmes.
    public function programmes()
    {
        return $this->belongsToMany(
            Programme::class,
            'quota_programme',
            'quota_id',
            'programme_id',
            'quota_id',
            'programme_id'
        )->withTimestamps();
    }

    public function applications()
    {
        return $this->hasMany(
            Application::class,
            'quota_id',
            'quota_id'
        );
    }

    public function branches()
    {
        return $this->belongsToMany(CompanyBranch::class, 'company_branch_placement_quota', 'quota_id', 'company_branch_id', 'quota_id', 'id');
    }

    public function industrySupervisors()
    {
        return $this->hasMany(
            IndustrySupervisor::class,
            'quota_id',
            'quota_id'
        );
    }

    // Scope for approved and released quotas
    public function scopeAvailable($query)
    {
        return $query
            ->where('quota_status', 'Approved')
            ->where('is_released', true);
    }

    // Get remaining slots
    public function getRemainingSlotsAttribute()
    {
        $approvedCount = $this->applications()
            ->whereIn('app_status', ['Approved', 'Recruited'])
            ->count();

        return max(
            0,
            $this->total_slots - $approvedCount
        );
    }
}
