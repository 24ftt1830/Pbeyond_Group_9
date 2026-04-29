<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('Company/Profile');
    }

    public function show()
{
    return Inertia::render('Company/Profile', [
        'user' => Auth::user()->load('company'),
    ]);
}
}