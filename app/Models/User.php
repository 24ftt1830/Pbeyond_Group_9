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
        'username', 'email', 'password', 'role'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function student() { return $this->hasOne(Student::class, 'user_id', 'user_id'); }
    public function company() { return $this->hasOne(Company::class, 'user_id', 'user_id'); }
    public function ildAdmin() { return $this->hasOne(IldAdmin::class, 'user_id', 'user_id'); }
    public function favourites()
    {
    return $this->hasMany(Favourite::class, 'user_id', 'user_id');}
    public function documents()
    {
    return $this->hasMany(Document::class, 'user_id', 'user_id');}

    public function reports()
    {
    return $this->hasMany(Report::class, 'user_id', 'user_id');}
}
