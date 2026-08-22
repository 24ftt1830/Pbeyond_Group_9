<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index()
    {
        return Inertia::render('Student/Logbook');
    }

    public function create(Request $request)
    {
        return Inertia::render('Student/LogbookSubmission', [
            'date' => $request->query('date'),
        ]);
    }
}