<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Application as StudentApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'quota_id' => 'required|exists:placement_quotas,quota_id',
        ]);

        // Check if the student record exists before applying
        if (! Auth::user()->student) {
            return back()->withErrors(['error' => 'Student profile not found.']);
        }

        try {
            StudentApplication::create([
                'student_id' => Auth::user()->student->student_id,
                'quota_id'   => $validated['quota_id'],
                'app_status' => 'Pending', // Fixed column name & casing
            ]);

            return back()->with('success', 'Application submitted successfully!');
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->withErrors(['error' => 'You have already applied to this specific quota.']);
        }
    }
}