<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
{
    $reports = Report::where('user_id', auth()->id())->orderBy('created_at', 'desc')->get();
    return Inertia::render('Student/PastReports', ['reports' => $reports]);
}

    public function create()
    {
        return Inertia::render('Student/ReportIssue');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company'        => 'required|string|max:255',
            'description'    => 'required|string',
            'issueType'      => 'required|string|max:100',
            'otherIssueType' => 'nullable|string|max:255',
        ]);

        Report::create([
            'user_id'          => auth()->id(),
            'company_name'     => $validated['company'],
            'description'      => $validated['description'],
            'issue_type'       => $validated['issueType'],
            'other_issue_type' => $validated['otherIssueType'],
            'status'           => 'pending',
        ]);

        return redirect()->route('student.past-reports')->with('success', 'Report submitted successfully.');
    }
}
