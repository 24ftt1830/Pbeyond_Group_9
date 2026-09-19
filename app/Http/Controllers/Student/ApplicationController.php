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

        $student = Auth::user()->student;

        if (!$student) {
            return back()->withErrors(['error' => 'Student record not found.']);
        }

        // Single source of truth check
        if (empty($student->cv_generated_at) || empty($student->cv_snapshot)) {
            return back()->withErrors([
                'error' => 'You must complete your profile and generate your CV before applying for a job placement.'
            ]);
        }

        try {
            StudentApplication::create([
                'student_id' => $student->student_id,
                'quota_id'   => $validated['quota_id'],
                'app_status' => 'Pending',
            ]);

            return back()->with('success', 'Application submitted successfully!');
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->withErrors(['error' => 'You have already applied to this specific quota.']);
        }
    }
}