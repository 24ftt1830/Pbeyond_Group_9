<?php

namespace App\Services;

use App\Models\AcademicSemester;
use App\Models\PlacementQuota;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuotaTermWindow
{
    /** Current opening month, when applicable, and the next two terms. */
    public function availableTerms(): Collection
    {
        $month = Carbon::now('Asia/Brunei')->startOfMonth();
        $nextMonth = $month->copy()->addMonth();
        $terms = AcademicSemester::whereDate('starts_on', '>=', $month->toDateString())
            ->orderBy('starts_on')->orderBy('id')->get();

        return $terms->filter(fn ($term) => $term->starts_on->toDateString() < $nextMonth->toDateString())
            ->merge($terms->filter(fn ($term) => $term->starts_on->toDateString() >= $nextMonth->toDateString())->take(2))
            ->values();

    }

    public function validateSelection(int $semesterId): void
    {
        if (!$this->availableTerms()->contains('id', $semesterId)) {
            throw ValidationException::withMessages([
                'academic_semester_id' => 'Choose an available term. The current term accepts requests only during its opening month.',
            ]);
        }
    }

    public function ensureApprovable(PlacementQuota $quota): void
    {
        // An existing approval remains valid after its original deadline.
        if ($quota->quota_status === 'Approved') {
            return;
        }

        $term = $quota->academicSemester;
        if ($quota->auto_rejected_at || ($term && $term->quota_deadline < Carbon::now('Asia/Brunei')->toDateString())) {
            throw ValidationException::withMessages([
                'quota' => 'This quota approval deadline has passed. The company must submit a request for an available term.',
            ]);
        }
    }

    /** Idempotent: quota expiry is committed under a row lock. */
    public function expirePending(): int
    {
        $monthStart = Carbon::now('Asia/Brunei')->startOfMonth()->toDateString();
        $expired = 0;
        PlacementQuota::where('quota_status', 'Pending')
            ->whereHas('academicSemester', fn ($query) => $query->whereDate('starts_on', '<', $monthStart))
            ->select('quota_id')->chunkById(100, function ($quotas) use (&$expired) {
                foreach ($quotas as $candidate) {
                    $expired += DB::transaction(function () use ($candidate) {
                        $quota = PlacementQuota::whereKey($candidate->getKey())->lockForUpdate()->first();
                        if (!$quota || $quota->quota_status !== 'Pending') {
                            return 0;
                        }
                        $term = $quota->academicSemester;
                        if (!$term || $term->quota_deadline >= Carbon::now('Asia/Brunei')->toDateString()) {
                            return 0;
                        }
                        $quota->forceFill([
                            'quota_status' => 'Rejected',
                            'is_released' => false,
                            'auto_rejected_at' => now(),
                            'rejection_reason' => 'Automatically rejected — approval deadline passed ('.$term->quota_deadline_label.').',
                        ])->save();
                        return 1;
                    }, 3);
                }
            }, 'quota_id');

        return $expired;
    }
}
