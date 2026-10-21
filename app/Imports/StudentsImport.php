<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Student;
use App\Models\AcademicSemester;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentsImport implements ToModel, WithHeadingRow, WithValidation
{
    private string $intakeName;

    public function __construct(private readonly int $intakeSemesterId)
    {
        $this->intakeName = AcademicSemester::query()->whereKey($intakeSemesterId)->value('name') ?? '';
    }

    public function rules(): array
    {
        return [
            'student_code' => ['required', 'string', 'max:50'],
            'full_name' => ['required', 'string', 'max:255'],
            'programme_id' => ['required', 'integer', 'exists:programmes,programme_id'],
            'email' => ['nullable', 'email', 'max:150'],
            'cgpa' => ['nullable', 'numeric', 'between:0,4'],
        ];
    }

    public function model(array $row)
    {
        $studentCode = trim((string) ($row['student_code'] ?? ''));
        $fullName = trim((string) ($row['full_name'] ?? ''));
        if ($studentCode === '' || $fullName === '') {
            throw ValidationException::withMessages(['file' => 'Every student row needs a student code and full name.']);
        }

        $student = Student::with('user')->where('pb_student_code', $studentCode)->first();
        $user = $student?->user;
        $providedEmail = trim((string) ($row['email'] ?? ''));
        if ($student && (! $user || $user->role !== 'Student')) {
            throw ValidationException::withMessages(['file' => 'Student '.$studentCode.' does not have a valid student login. Correct the existing record first.']);
        }
        if ($user && $providedEmail !== '' && strcasecmp($user->email, $providedEmail) !== 0) {
            throw ValidationException::withMessages(['file' => 'Student '.$studentCode.' already has a different email. Edit the account email in Manage Users first.']);
        }

        if (! $user) {
            $email = $providedEmail !== '' ? $providedEmail : $studentCode.'@student.pb.edu.bn';
            if (User::where('email', $email)->orWhere('username', $studentCode)->exists()) {
                throw ValidationException::withMessages(['file' => 'The email or username for student '.$studentCode.' already belongs to another account.']);
            }
            $user = User::create([
                'username' => $studentCode, 'email' => $email,
                'password' => Hash::make(Str::random(64)), 'role' => 'Student',
            ]);
        }

        // Updating profile data never resets a password or releases account access.
        return $user->student()->updateOrCreate(
            ['pb_student_code' => $studentCode],
            [
                'programme_id' => $row['programme_id'],
                'intake_semester_id' => $this->intakeSemesterId,
                'intake_session' => $this->intakeName,
                'full_name'    => $fullName,
                'cgpa'         => ($row['cgpa'] ?? '') !== '' ? $row['cgpa'] : 0.0,
            ]
        );
    }
}
