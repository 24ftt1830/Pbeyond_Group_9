<?php

return [
    // Local demo override for future logbooks, early CSV downloads and approved future attendance.
    // LogbookTesting also checks the application environment.
    'allow_future_dates' => (bool) env('LOGBOOK_ALLOW_FUTURE_DATES', false),
];
