<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlacementQuota extends Model
{
    protected $table = 'placement_quotas';
    protected $primaryKey = 'quota_id';
    public $timestamps = true;

    protected $fillable = [
        'company_id', 
        'programme_id', 
        'job_title', 
        'job_description',
        'total_slots', 
        'min_cgpa', 
        'quota_status', 
        'is_released',
        'interview_required',
    ];

    protected $casts = [
        'is_released' => 'boolean',
        'min_cgpa' => 'decimal:2'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'company_id');
    }

    public function programme()
    {
        return $this->belongsTo(Programme::class, 'programme_id', 'programme_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'quota_id', 'quota_id');
    }

    // Scope for approved and released quotas
    public function scopeAvailable($query)
    {
        return $query->where('quota_status', 'Approved')
                     ->where('is_released', true);
    }

    // Get remaining slots
    public function getRemainingSlotsAttribute()
    {
        $approvedCount = $this->applications()
                              ->where('app_status', 'Approved')
                              ->count();
        return max(0, $this->total_slots - $approvedCount);
    }
}
