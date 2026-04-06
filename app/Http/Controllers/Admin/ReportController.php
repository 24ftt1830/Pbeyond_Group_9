<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::with('user')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Reports', [
            'reports' => $reports,
        ]);
    }

    public function resolve($id)
    {
        $report = Report::findOrFail($id);
        $report->status = 'resolved';
        $report->save();
        return back()->with('success', 'Report marked as resolved.');
    }
}
