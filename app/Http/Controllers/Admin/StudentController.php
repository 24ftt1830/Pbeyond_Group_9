<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['user', 'programme.school', 'skills', 'languages'])->get();

        return Inertia::render('Admin/Students', [
            'students' => $students,
        ]);
    }

public function show($id)
{
    $student = Student::with([
        'user',
        'programme.school',
        'skills',
        'languages',
        'user.documents',
        'applications' => function ($query) {
            $query->with(['quota.company'])->orderBy('apply_date', 'desc');
        }
    ])->findOrFail($id);

    return Inertia::render('Admin/StudentShow', [
        'student' => $student,
    ]);
}

    public function approve($id)
    {
        $student = Student::findOrFail($id);
        $student->vetting_status = 'Approved';
        $student->save();

        return redirect()->route('admin.students')->with('success', 'Student approved.');
    }

    public function reject($id)
    {
        $student = Student::findOrFail($id);
        $student->vetting_status = 'Rejected';
        $student->save();

        return redirect()->route('admin.students')->with('success', 'Student rejected.');
    }
}
