<?php

namespace App\Http\Middleware;

use App\Services\QuotaTermWindow;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExpireQuotaRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        if (in_array($request->user()?->role, ['Admin', 'Company'], true)) {
            app(QuotaTermWindow::class)->expirePending();
        }

        return $next($request);
    }
}
