<?php

namespace App\Support;

final class LogbookTesting
{
    public static function allowsFutureDates(): bool
    {
        return app()->environment('local') && config('logbooks.allow_future_dates', false);
    }
}
