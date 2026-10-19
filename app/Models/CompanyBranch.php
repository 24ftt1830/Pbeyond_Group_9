<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyBranch extends Model
{
    public const DISTRICTS = ['Brunei-Muara', 'Belait', 'Tutong', 'Temburong', 'Overseas'];

    protected $fillable = ['company_id', 'name', 'address', 'district'];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'company_id');
    }

    public function quotas()
    {
        return $this->belongsToMany(PlacementQuota::class, 'company_branch_placement_quota', 'company_branch_id', 'quota_id', 'id', 'quota_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'company_branch_id');
    }
}
