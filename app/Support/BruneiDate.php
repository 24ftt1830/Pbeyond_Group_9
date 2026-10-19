<?php

namespace App\Support;

use Illuminate\Support\Carbon;

/** Calendar-day comparisons for logbook rules in Brunei time. */
final class BruneiDate
{
    private const TIMEZONE = 'Asia/Brunei';

    public static function today(): string
    {
        return Carbon::now(self::TIMEZONE)->toDateString();
    }

    public static function isAfterToday(string $date): bool
    {
        return $date > self::today();
    }

    public static function isPast(Carbon|string $date): bool
    {
        $date = $date instanceof Carbon ? $date->toDateString() : $date;

        return $date < self::today();
    }
}
