<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        $student = auth()->user()->student;
        
        // Return relevant paths so your frontend can show which files are uploaded
        return Inertia::render('Student/Documentations', [
            'documents' => [
                'cv' => $student->cv_file_path,
                'identity_card' => $student->ic_file_path,
                'drivers_license' => $student->license_file_path,
                'results' => $student->results_file_path,
            ],
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'type' => 'required|in:cv,identity_card,drivers_license,results',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $student = auth()->user()->student;
        $type = $request->type;

        // Map the type to the specific column in the students table
        $columnMap = [
            'cv' => 'cv_file_path',
            'identity_card' => 'ic_file_path',
            'drivers_license' => 'license_file_path',
            'results' => 'results_file_path',
        ];

        $column = $columnMap[$type];

        // Delete old file if it exists
        if ($student->$column) {
            Storage::disk('public')->delete($student->$column);
        }

        // Store new file
        $path = $request->file('file')->store("students/{$student->student_id}", 'public');

        // Update the student record
        $student->update([
            $column => $path,
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy(Request $request)
    {
        // Added validation to identify which document to delete
        $request->validate(['type' => 'required|in:cv,identity_card,drivers_license,results']);
        
        $student = auth()->user()->student;
        $type = $request->type;

        $columnMap = [
            'cv' => 'cv_file_path',
            'identity_card' => 'ic_file_path',
            'drivers_license' => 'license_file_path',
            'results' => 'results_file_path',
        ];

        $column = $columnMap[$type];

        // Delete file and clear column
        if ($student->$column) {
            Storage::disk('public')->delete($student->$column);
            $student->update([$column => null]);
        }

        return back()->with('success', 'Document deleted.');
    }
}