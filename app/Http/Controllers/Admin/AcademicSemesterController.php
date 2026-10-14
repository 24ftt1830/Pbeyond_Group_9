<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSemester;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AcademicSemesterController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/AcademicSemesters', [
            'semesters' => AcademicSemester::orderBy('starts_on')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:academic_semesters,name'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
        ]);

        $this->ensureNoOverlap($data['starts_on'], $data['ends_on']);
        AcademicSemester::create($data);

        return back()->with('success', 'Semester added.');
    }

    public function update(Request $request, AcademicSemester $semester)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('academic_semesters', 'name')->ignore($semester->id)],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
        ]);

        $this->ensureNoOverlap($data['starts_on'], $data['ends_on'], $semester->id);
        $semester->update($data);
        $semester->intakeStudents()->update(['intake_session' => $semester->name]);

        return back()->with('success', 'Semester dates updated.');
    }

    private function ensureNoOverlap(string $startsOn, string $endsOn, ?int $ignoreId = null): void
    {
        $overlap = AcademicSemester::query()
            ->whereDate('starts_on', '<=', $endsOn)
            ->whereDate('ends_on', '>=', $startsOn)
            ->when($ignoreId, fn ($query) => $query->where('id', '<>', $ignoreId))
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'starts_on' => 'Semester date ranges cannot overlap. Adjust the dates so each day belongs to one semester.',
            ]);
        }
    }
}
