<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $student = auth()->user()->student;

        if (!$student) {
            $student = auth()->user()->student()->create([
                'pb_student_code' => 'STU' . auth()->id(),
                'full_name' => auth()->user()->username,
                'ic_number' => '',
                'ic_colour' => 'Yellow',
                'programme_id' => 1,
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
            'full_name'        => 'nullable|string|max:255',
            'ic_number'        => 'nullable|string|max:20',
            'ic_colour'        => 'nullable|in:Yellow,Red,Purple',
            'intake_session'   => 'nullable|string|max:50',
            'postal_address'   => 'nullable|string',
            'date_of_birth'    => 'nullable|date',
            'place_of_birth'   => 'nullable|string|max:100',
            'gender'           => 'nullable|in:Male,Female',
            'religion'         => 'nullable|string|max:50',
            'nationality'      => 'nullable|string|max:100',
            'race'             => 'nullable|string|max:50',
            'mobile_phone'     => 'nullable|string|max:20',
            'cgpa'             => 'nullable|numeric|min:0|max:4',
            'work_experience'  => 'nullable|string',
            'emergency_no'     => 'nullable|string|max:20',

            // Passport photo
            'passport_photo'   => 'nullable|image|mimes:jpeg,png,jpg|max:2048',

            // CV upload
            'cv'               => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $student->full_name = $request->full_name;
        $student->ic_number = $request->ic_number;
        $student->ic_colour = $request->ic_colour;
        $student->intake_session = $request->intake_session;
        $student->postal_address = $request->postal_address;
        $student->date_of_birth = $request->date_of_birth;
        $student->place_of_birth = $request->place_of_birth;
        $student->gender = $request->gender;
        $student->religion = $request->religion;
        $student->nationality = $request->nationality;
        $student->race = $request->race;
        $student->mobile_phone = $request->mobile_phone;
        $student->cgpa = $request->cgpa;
        $student->work_experience = $request->work_experience;
        $student->emergency_no = $request->emergency_no;

        // Passport photo upload
        if ($request->hasFile('passport_photo')) {
            if ($student->passport_photo_path) {
                Storage::disk('public')->delete($student->passport_photo_path);
            }

            $student->passport_photo_path = $request->file('passport_photo')
                ->store('passport_photos', 'public');
        }

        // CV upload
        if ($request->hasFile('cv')) {
            if ($student->cv_file_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $student->cv_file_path));
            }

            $filename = strtolower(str_replace(' ', '_', $student->full_name)) . '.' .
                $request->file('cv')->getClientOriginalExtension();

            $path = $request->file('cv')->storeAs('cv', $filename, 'public');

            $student->cv_file_path = '/storage/' . $path;
        }

        $student->save();

        return redirect()->route('student.profile')
            ->with('success', 'Profile updated successfully.');
    }
}
