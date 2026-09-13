<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies';
    protected $primaryKey = 'company_id';
    public $timestamps = true;

    protected $fillable = [
        'company_name',
        'location_type',
        'industry_sector',
        'office_address',
        'description',
        'additional_information',
        'is_approved',
        'access_key',
        'access_key_expires_at',
        'completed_onboarding_tasks',
    ];

    protected $casts = [
        'access_key_expires_at' => 'datetime',
        'completed_onboarding_tasks' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'company_id', 'company_id');
    }

    public function placementQuotas()
    {
        return $this->hasMany(PlacementQuota::class, 'company_id', 'company_id');
    }

    public function industrySupervisors()
    {
        return $this->hasMany(IndustrySupervisor::class, 'company_id', 'company_id');
    }

    public function favourites()
    {
        return $this->hasMany(Favourite::class, 'company_id', 'company_id');
    }

    public function hasCompletedProfile(): bool
    {
        return !empty($this->company_name) && 
               !empty($this->office_address) && 
               !empty($this->industry_sector);
    }

    public function hasCreatedQuotas(): bool
    {
        return $this->placementQuotas()->exists();
    }

    public function hasAddedSupervisors(): bool
    {
        return $this->industrySupervisors()->exists();
    }
}