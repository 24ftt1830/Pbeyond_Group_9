<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationStatusHistory extends Model
{
    public $timestamps = false;
    protected $fillable = ['application_id', 'from_status', 'to_status', 'changed_by_user_id', 'created_at'];
    protected $casts = ['created_at' => 'datetime'];

    protected static function booted(): void
    {
        static::creating(fn ($history) => $history->created_at ??= now());
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
