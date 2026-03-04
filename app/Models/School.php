<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $table = 'schools';
    protected $primaryKey = 'school_id';
    public $timestamps = false;

    protected $fillable = [
        'school_code', 'school_name'
    ];

    public function programmes()
    {
        return $this->hasMany(Programme::class, 'school_id', 'school_id');
    }

    public function ildAdmins()
    {
        return $this->hasMany(IldAdmin::class, 'school_id', 'school_id');
    }
}
