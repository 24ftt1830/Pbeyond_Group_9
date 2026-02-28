<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IldAdmin extends Model
{
    protected $table = 'ild_admins';
    protected $primaryKey = 'admin_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'full_name', 'school_id', 'privilege_level'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id', 'school_id');
    }
}
