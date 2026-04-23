<?php

namespace App\Http\Controllers\Student;

use App\Models\Application as StudentApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Application;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'quota_id' => 'required|exists:quotas,quota_id',
        ]);

        try {
            StudentApplication::create([
                'student_id' => Auth::user()->student->student_id,
                'quota_id' => $validated['quota_id'],
                'status' => 'pending',
            ]);
            return back()->with('success', 'Application submitted successfully!');
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->withErrors(['error' => 'You have already submitted an application.']);
        }
    }
}
