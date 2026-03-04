<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $primaryKey = 'user_id';
    public $timestamps = true;
    protected $fillable = [
        'username', 'email', 'password_hash', 'role'
    ];

    protected $hidden = [
        'password_hash',
    ];

    // Relationships
    public function student()
    {
        return $this->hasOne(Student::class, 'user_id', 'user_id');
    }

    public function company()
    {
        return $this->hasOne(Company::class, 'user_id', 'user_id');
    }

    public function ildAdmin()
    {
        return $this->hasOne(IldAdmin::class, 'user_id', 'user_id');
    }
}
