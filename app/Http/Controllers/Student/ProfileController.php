<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $student = auth()->user()->student;

        // If no student record exists, create one with minimal data
        if (!$student) {
            $student = auth()->user()->student()->create([
                'pb_student_code' => 'STU' . auth()->id(),
                'full_name' => auth()->user()->username,
                'ic_number' => '',
                'ic_colour' => 'Yellow',
                'programme_id' => 1, // adjust to a valid programme ID
                'intake_session' => '',
                'postal_address' => '',
                'date_of_birth' => now(),
                'place_of_birth' => '',
                'gender' => 'Male',
                'religion' => '',
                'nationality' => '',
                'race' => '',
                'mobile_phone' => '',
                'cgpa' => 0,
                'work_experience' => null,
                'emergency_no' => '',
                'cv_file_path' => null,
                'vetting_status' => 'Pending',
            ]);
        }

        return Inertia::render('Student/Profile', [
            'student' => $student,
        ]);
    }

    public function update(Request $request)
    {
        $student = auth()->user()->student;

        $validated = $request->validate([
            'full_name'        => 'required|string|max:255',
            'ic_number'        => 'required|string|max:20',
            'ic_colour'        => 'required|in:Yellow,Red,Purple',
            'intake_session'   => 'required|string|max:50',
            'postal_address'   => 'required|string',
            'date_of_birth'    => 'required|date',
            'place_of_birth'   => 'required|string|max:100',
            'gender'           => 'required|in:Male,Female',
            'religion'         => 'required|string|max:50',
            'nationality'      => 'required|string|max:100',
            'race'             => 'required|string|max:50',
            'mobile_phone'     => 'required|string|max:20',
            'cgpa'             => 'required|numeric|min:0|max:4',
            'work_experience'  => 'nullable|string',
            'emergency_no'     => 'required|string|max:20',
        ]);

        $student->update($validated);

        return redirect()->route('student.profile')->with('success', 'Profile updated successfully.');
    }
}
