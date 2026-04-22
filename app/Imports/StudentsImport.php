<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Access data by header name (slugified)
        // Ensure your Excel headers match these names (e.g., "Student Code", "Full Name")
        $studentCode = $row['student_code'] ?? null;
        $fullName    = $row['full_name'] ?? null;
        $programmeId = $row['programme_id'] ?? null;
        $cgpa        = $row['cgpa'] ?? 0.0;

        if (!$studentCode || !$fullName) {
            return null; // Skip invalid rows
        }

        $email = $studentCode . '@pb.student.edu.bn';

        // 1. Create User
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'username' => $studentCode,
                'password' => Hash::make($studentCode),
                'role'     => 'Student',
            ]
        );

        // 2. Create or Update Student Profile
        return $user->student()->updateOrCreate(
            ['pb_student_code' => $studentCode],
            [
                'programme_id' => $programmeId,
                'full_name'    => $fullName,
                'cgpa'         => $cgpa,
            ]
        );
    }
}
