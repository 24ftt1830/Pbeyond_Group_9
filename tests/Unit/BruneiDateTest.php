<?php

use App\Support\BruneiDate;
use Illuminate\Support\Carbon;

uses(Tests\TestCase::class);

afterEach(function () {
    Carbon::setTestNow();
});

it('uses the current Brunei calendar day after UTC midnight has not arrived', function () {
    Carbon::setTestNow(Carbon::parse('2026-10-17 16:30:00', 'UTC'));

    expect(BruneiDate::today())->toBe('2026-10-18')
        ->and(BruneiDate::isAfterToday('2026-10-18'))->toBeFalse()
        ->and(BruneiDate::isAfterToday('2026-10-19'))->toBeTrue()
        ->and(BruneiDate::isPast('2026-10-17'))->toBeTrue()
        ->and(BruneiDate::isPast('2026-10-18'))->toBeFalse();
});

it('keeps the previous day current before Brunei midnight', function () {
    Carbon::setTestNow(Carbon::parse('2026-10-17 15:59:00', 'UTC'));

    expect(BruneiDate::today())->toBe('2026-10-17')
        ->and(BruneiDate::isAfterToday('2026-10-17'))->toBeFalse()
        ->and(BruneiDate::isAfterToday('2026-10-18'))->toBeTrue();
});
