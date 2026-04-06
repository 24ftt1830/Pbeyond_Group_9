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
        'is_approved'
    ];

    public function users()
    {
        // One company can have many users (Staff/HR)
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
}
