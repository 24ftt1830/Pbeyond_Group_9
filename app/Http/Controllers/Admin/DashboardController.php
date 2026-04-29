<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Student;
use App\Models\Application;
use App\Models\PlacementQuota;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
{
    return Inertia::render('Admin/Dashboard');
}
}
