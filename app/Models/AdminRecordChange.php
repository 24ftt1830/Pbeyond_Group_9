<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminRecordChange extends Model
{
    protected $guarded = [];

    protected $casts = [
        'before_snapshot' => 'array',
        'after_snapshot' => 'array',
    ];

    public static function record(?User $actor, Model $subject, string $action, ?array $before = null): void
    {
        if ($actor?->role !== 'Admin') {
            return;
        }

        self::recordWorkflow($actor, $subject, $action, $before);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /** Record an authorized internship workflow action, including student and supervisor actions. */
    public static function recordWorkflow(User $actor, Model $subject, string $action, ?array $before = null, array $context = []): void
    {
        $after = $subject->fresh()?->toArray();
        if ($context) {
            $after ??= [];
            $after['_workflow'] = $context;
        }

        self::create([
            'user_id' => $actor->getKey(),
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'action' => $action,
            'before_snapshot' => $before,
            'after_snapshot' => $after,
        ]);
    }
}
