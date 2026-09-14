<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $student = auth()->user()->student;

        if ($student) {
            $student->load([
                'programme',
                'education',
                'professionalProfile',
                'projects',
                'activities',
                'achievements',
                'referees',
                'softSkills',
                'workExperiences',
                'skills',
                'languages',
            ]);
        }

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

            $student->load([
                'programme',
                'education',
                'professionalProfile',
                'projects',
                'activities',
                'achievements',
                'referees',
                'softSkills',
                'workExperiences',
                'skills',
                'languages',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Determine whether the student has completed the required CV information
        |--------------------------------------------------------------------------
        |
        | The CV can only be generated when the required profile information
        | already exists.
        |
        */

        $canGenerateCv = $this->canGenerateCv($student);

        return Inertia::render('Student/Profile', [
            'student' => $student,
            'canGenerateCv' => $canGenerateCv,
            'hasGeneratedCv' => !empty($student->cv_snapshot) && !empty($student->cv_generated_at),
            'cvGeneratedAt' => $student->cv_generated_at,
        ]);
    }

    public function generateCv()
    {
        $student = auth()->user()->student;

        if (!$student) {
            return redirect()
                ->route('student.profile')
                ->with('error', 'Student profile not found.');
        }

        $student->load([
            'programme',
            'education',
            'professionalProfile',
            'projects',
            'activities',
            'achievements',
            'referees',
            'softSkills',
            'workExperiences',
            'skills',
            'languages',
        ]);

        $missingFields = $this->getMissingCvFields($student);

        if (!empty($missingFields)) {
            return redirect()
                ->back()
                ->with('error', 'Must complete all required info before generating CV. Missing: ' . implode(', ', $missingFields));
        }

        $snapshot = [
            'student_id' => $student->student_id,
            'pb_student_code' => $student->pb_student_code,
            'full_name' => $student->full_name,
            'ic_number' => $student->ic_number,
            'mobile_phone' => $student->mobile_phone,
            'postal_address' => $student->postal_address,
            'date_of_birth' => $student->date_of_birth,
            'place_of_birth' => $student->place_of_birth,
            'gender' => $student->gender,
            'nationality' => $student->nationality,
            'race' => $student->race,
            'cgpa' => $student->cgpa,
            'passport_photo_path' => $student->passport_photo_path,
            'programme' => $student->programme ? [
                'programme_id' => $student->programme->programme_id,
                'programme_name' => $student->programme->programme_name,
            ] : null,
            'user' => [
                'email' => auth()->user()->email,
            ],
            'professional_profile' => $student->professionalProfile ? [
                'id' => $student->professionalProfile->id,
                'profile' => $student->professionalProfile->profile,
            ] : null,
            'education' => $student->education->map(fn ($item) => [
                'id' => $item->id,
                'institution' => $item->institution,
                'qualification' => $item->qualification,
                'field_of_study' => $item->field_of_study,
                'start_date' => $item->start_date,
                'end_date' => $item->end_date,
                'description' => $item->description,
            ])->values()->all(),
            'work_experiences' => $student->workExperiences->map(fn ($item) => [
                'id' => $item->id,
                'company' => $item->company,
                'position' => $item->position,
                'start_date' => $item->start_date,
                'end_date' => $item->end_date,
                'description' => $item->description,
            ])->values()->all(),
            'projects' => $student->projects->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'technologies' => $item->technologies,
                'project_url' => $item->project_url,
                'start_date' => $item->start_date,
                'end_date' => $item->end_date,
            ])->values()->all(),
            'activities' => $student->activities->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'role' => $item->role,
                'start_date' => $item->start_date,
                'end_date' => $item->end_date,
            ])->values()->all(),
            'achievements' => $student->achievements->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'issuer' => $item->issuer,
                'achievement_date' => $item->achievement_date,
            ])->values()->all(),
            'referees' => $student->referees->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'position' => $item->position,
                'organization' => $item->organization,
                'email' => $item->email,
                'phone' => $item->phone,
            ])->values()->all(),
            'soft_skills' => $student->softSkills->map(fn ($item) => [
                'id' => $item->id,
                'skill' => $item->skill,
                'description' => $item->description,
            ])->values()->all(),
            'skills' => $student->skills->map(fn ($item) => [
                'skill_id' => $item->skill_id,
                'skill_name' => $item->skill_name,
            ])->values()->all(),
            'languages' => $student->languages->map(fn ($item) => [
                'language_id' => $item->language_id,
                'language_name' => $item->language_name,
            ])->values()->all(),
        ];

        $student->cv_snapshot = $snapshot;
        $student->cv_generated_at = now();
        $student->save();

        return redirect()
            ->route('student.cv-generator')
            ->with('success', 'CV generated successfully.');
    }

    private function getMissingCvFields($student): array
    {
        $missing = [];
        if (!$student->mobile_phone) $missing[] = 'Phone Number';
        if (!$student->postal_address) $missing[] = 'Address';
        if (!$student->passport_photo_path) $missing[] = 'Passport Photo';
        if (!$student->education()->exists()) $missing[] = 'Education History';
        if (!$student->skills()->exists()) $missing[] = 'Skills';

        return $missing;
    }

    private function canGenerateCv($student): bool
    {
        return empty($this->getMissingCvFields($student));
    }

    public function cvGenerator()
    {
        $student = auth()->user()->student;

        /*
        |--------------------------------------------------------------------------
        | CV Checkpoint
        |--------------------------------------------------------------------------
        |
        | The CV is generated from a saved snapshot.
        | Changes made to the student's profile will NOT affect the
        | existing CV until the student clicks "Generate CV" again.
        |
        */

        if (empty($student->cv_snapshot)) {
            return redirect()
                ->route('student.profile')
                ->with(
                    'error',
                    'Please generate your CV from your profile before viewing it.'
                );
        }

        return Inertia::render('Student/generator_cv', [
            // The generator receives the saved snapshot as the student payload.
            // This keeps the displayed CV frozen until Generate/Regenerate is clicked.
            'student' => $student->cv_snapshot,
            'cvSnapshot' => $student->cv_snapshot,
            'cvGeneratedAt' => $student->cv_generated_at,
        ]);
    }

    public function update(Request $request)
    {
        $student = auth()->user()->student;

        $validated = $request->validate([
            // Existing student information
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
            'passport_photo'  => 'nullable|image|mimes:jpeg,png,jpg|max:2048',

            // CV information
            'professional_profile' => 'nullable|string',

            'education' => 'nullable|array',
            'education.*.institution' => 'nullable|string|max:255',
            'education.*.qualification' => 'nullable|string|max:255',
            'education.*.field_of_study' => 'nullable|string|max:255',
            'education.*.start_date' => 'nullable|date',
            'education.*.end_date' => 'nullable|date',
            'education.*.description' => 'nullable|string',

            'work_experiences' => 'nullable|array',
            'work_experiences.*.company' => 'nullable|string|max:255',
            'work_experiences.*.position' => 'nullable|string|max:255',
            'work_experiences.*.start_date' => 'nullable|date',
            'work_experiences.*.end_date' => 'nullable|date',
            'work_experiences.*.description' => 'nullable|string',

            'projects' => 'nullable|array',
            'projects.*.title' => 'nullable|string|max:255',
            'projects.*.description' => 'nullable|string',
            'projects.*.technologies' => 'nullable|string',
            'projects.*.project_url' => 'nullable|string|max:255',
            'projects.*.start_date' => 'nullable|date',
            'projects.*.end_date' => 'nullable|date',

            'activities' => 'nullable|array',
            'activities.*.title' => 'nullable|string|max:255',
            'activities.*.description' => 'nullable|string',
            'activities.*.role' => 'nullable|string|max:255',
            'activities.*.start_date' => 'nullable|date',
            'activities.*.end_date' => 'nullable|date',

            'achievements' => 'nullable|array',
            'achievements.*.title' => 'nullable|string|max:255',
            'achievements.*.description' => 'nullable|string',
            'achievements.*.issuer' => 'nullable|string|max:255',
            'achievements.*.achievement_date' => 'nullable|date',

            'referees' => 'nullable|array',
            'referees.*.name' => 'nullable|string|max:255',
            'referees.*.position' => 'nullable|string|max:255',
            'referees.*.organization' => 'nullable|string|max:255',
            'referees.*.email' => 'nullable|email|max:255',
            'referees.*.phone' => 'nullable|string|max:50',

            'soft_skills' => 'nullable|array',
            'soft_skills.*.skill' => 'nullable|string|max:255',
            'soft_skills.*.description' => 'nullable|string',

            'skills' => 'nullable|array',
            'skills.*.skill_name' => 'nullable|string|max:255',

            'languages' => 'nullable|array',
            'languages.*.language_name' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $student, $validated) {

            // Existing student information
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

            // Passport photo
            if ($request->hasFile('passport_photo')) {

                if ($student->passport_photo_path) {
                    Storage::disk('public')->delete(
                        $student->passport_photo_path
                    );
                }

                $student->passport_photo_path = $request
                    ->file('passport_photo')
                    ->store('passport_photos', 'public');
            }

            $student->save();

            // Professional Profile
            if ($request->filled('professional_profile')) {

                $student->professionalProfile()->updateOrCreate(
                    ['student_id' => $student->student_id],
                    [
                        'profile' => $request->professional_profile,
                        'active' => true,
                    ]
                );
            }

            // Education
            if ($request->has('education')) {

                $student->education()->delete();

                foreach ($validated['education'] ?? [] as $education) {

                    if (
                        !empty($education['institution']) &&
                        !empty($education['qualification'])
                    ) {
                        $student->education()->create($education);
                    }
                }
            }

            // Work Experience
            if ($request->has('work_experiences')) {

                $student->workExperiences()->delete();

                foreach ($validated['work_experiences'] ?? [] as $experience) {

                    if (
                        !empty($experience['company']) &&
                        !empty($experience['position'])
                    ) {
                        $student->workExperiences()->create($experience);
                    }
                }
            }

            // Projects
            if ($request->has('projects')) {

                $student->projects()->delete();

                foreach ($validated['projects'] ?? [] as $project) {

                    if (!empty($project['title'])) {
                        $student->projects()->create($project);
                    }
                }
            }

            // Activities
            if ($request->has('activities')) {

                $student->activities()->delete();

                foreach ($validated['activities'] ?? [] as $activity) {

                    if (!empty($activity['title'])) {
                        $student->activities()->create($activity);
                    }
                }
            }

            // Achievements
            if ($request->has('achievements')) {

                $student->achievements()->delete();

                foreach ($validated['achievements'] ?? [] as $achievement) {

                    if (!empty($achievement['title'])) {
                        $student->achievements()->create($achievement);
                    }
                }
            }

            // Referees
            if ($request->has('referees')) {

                $student->referees()->delete();

                foreach ($validated['referees'] ?? [] as $referee) {

                    if (!empty($referee['name'])) {
                        $student->referees()->create($referee);
                    }
                }
            }

            // Soft Skills
            if ($request->has('soft_skills')) {

                $student->softSkills()->delete();

                foreach ($validated['soft_skills'] ?? [] as $softSkill) {

                    if (!empty($softSkill['skill'])) {
                        $student->softSkills()->create($softSkill);
                    }
                }
            }

            // Technical Skills
            if ($request->has('skills')) {

                $student->skills()->delete();

                foreach ($validated['skills'] ?? [] as $skill) {

                    if (!empty($skill['skill_name'])) {

                        $student->skills()->create([
                            'skill_name' => $skill['skill_name'],
                        ]);
                    }
                }
            }

            // Languages
            if ($request->has('languages')) {

                $student->languages()->delete();

                foreach ($validated['languages'] ?? [] as $language) {

                    if (!empty($language['language_name'])) {

                        $student->languages()->create([
                            'language_name' => $language['language_name'],
                        ]);
                    }
                }
            }
        });

        return redirect()
            ->route('student.profile')
            ->with('success', 'Profile updated successfully.');
    }
}