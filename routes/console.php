<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\QuotaTermWindow;

Artisan::command('quotas:expire', function (QuotaTermWindow $window) {
    $this->info($window->expirePending().' pending quota request(s) expired.');
})->purpose('Reject quota requests that passed their approval deadline');

Schedule::command('quotas:expire')->dailyAt('00:00')->timezone('Asia/Brunei')->withoutOverlapping();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
