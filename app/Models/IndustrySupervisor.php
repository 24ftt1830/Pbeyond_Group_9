<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IndustrySupervisor extends Model
{
    protected $table = 'industry_supervisors';

    protected $primaryKey = 'supervisor_id';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'company_id',
        'quota_id',
        'full_name',
        'email',
        'phone',
        'position',
    ];

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id',
            'user_id'
        );
    }

    public function company()
    {
        return $this->belongsTo(
            Company::class,
            'company_id',
            'company_id'
        );
    }

    public function quota()
    {
        return $this->belongsTo(
            PlacementQuota::class,
            'quota_id',
            'quota_id'
        );
    }

    public function applications()
    {
        return $this->hasManyThrough(
            Application::class,
            SupervisorAssignment::class,
            'supervisor_id',
            'student_id',
            'supervisor_id',
            'student_id'
        )->whereExists(function ($query) {
                $query->selectRaw('1')->from('placement_quotas as assigned_quota')
                    ->join('industry_supervisors as assigned_industry', 'assigned_industry.company_id', '=', 'assigned_quota.company_id')
                    ->whereColumn('assigned_quota.quota_id', 'applications.quota_id')
                    ->whereColumn('assigned_industry.supervisor_id', 'supervisor_assignments.supervisor_id');
            })
            ->where('applications.app_status', 'Recruited')
            ->select('applications.*');
    }

    public function assignments()
    {
        return $this->hasMany(
            SupervisorAssignment::class,
            'supervisor_id',
            'supervisor_id'
        );
    }

    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'supervisor_assignments',
            'supervisor_id',
            'student_id'
        )->whereExists(function ($query) {
                // Keep company checks inside this subquery: whereHas/withCount
                // rebuild the outer relation query and do not retain extra joins.
                $query->selectRaw('1')->from('applications')
                    ->join('placement_quotas', 'placement_quotas.quota_id', '=', 'applications.quota_id')
                    ->join('industry_supervisors as assigned_industry', 'assigned_industry.company_id', '=', 'placement_quotas.company_id')
                    ->whereColumn('applications.student_id', 'students.student_id')
                    ->whereColumn('assigned_industry.supervisor_id', 'supervisor_assignments.supervisor_id')
                    ->where('applications.app_status', 'Recruited');
            });
    }
}
