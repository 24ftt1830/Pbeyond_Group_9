<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Validation\ValidationException;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $primaryKey = 'user_id';
    public $timestamps = true;

    protected $fillable = [
        'username', 'email', 'password', 'role', 'company_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'hr_company_id',
        'student_invitation_attempt_id',
    ];

    protected $casts = [
        'student_access_released_at' => 'datetime',
        'student_password_set_at' => 'datetime',
        'student_invitation_sent_at' => 'datetime',
    ];

    public function requiresStudentPasswordSetup(): bool
    {
        return $this->role === 'Student' && $this->student_password_set_at === null;
    }

    public function studentAccessIsUnreleased(): bool
    {
        return $this->role === 'Student' && $this->student_access_released_at === null;
    }

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if ($user->exists && $user->getOriginal('role') === 'Company'
                && ($user->role !== 'Company' || (string) $user->company_id !== (string) $user->getOriginal('company_id'))) {
                throw ValidationException::withMessages([
                    'company_id' => 'The HR account stays linked to its existing company. Edit its login details instead.',
                ]);
            }

            if ($user->role !== 'Company') {
                return;
            }

            if ($user->company_id === null) {
                // Allow editing old unassigned accounts, but new HR accounts need a company.
                if ($user->exists && ! $user->isDirty('company_id')) {
                    return;
                }
                throw ValidationException::withMessages([
                    'company_id' => 'Select an existing company for this HR account.',
                ]);
            }

            $duplicate = static::where('role', 'Company')->where('company_id', $user->company_id)
                ->when($user->exists, fn ($query) => $query->where('user_id', '<>', $user->getKey()))
                ->exists();

            if ($duplicate) {
                throw ValidationException::withMessages([
                    'company_id' => 'This company already has an HR account. Edit that account instead of creating another.',
                ]);
            }
        });
    }

    public function isAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    public function isCompany(): bool
    {
        return $this->role === 'company';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isAcademicSupervisor(): bool
    {
        return $this->role === 'Academic Supervisor';
    }

    public function isIndustrySupervisor(): bool
    {
        return $this->role === 'Industry Supervisor';
    }

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function student()
    {
        return $this->hasOne(
            Student::class,
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

    public function industrySupervisor()
    {
        return $this->hasOne(
            IndustrySupervisor::class,
            'user_id',
            'user_id'
        );
    }

    public function ildAdmin()
    {
        return $this->hasOne(
            IldAdmin::class,
            'user_id',
            'user_id'
        );
    }

    public function favourites()
    {
        return $this->hasMany(
            Favourite::class,
            'user_id',
            'user_id'
        );
    }

    public function documents()
    {
        return $this->hasMany(
            Document::class,
            'user_id',
            'user_id'
        );
    }

    public function reports()
    {
        return $this->hasMany(
            Report::class,
            'user_id',
            'user_id'
        );
    }
}
