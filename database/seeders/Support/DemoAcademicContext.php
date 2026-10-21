<?php

namespace Database\Seeders\Support;

use App\Models\AcademicSemester;
use App\Services\QuotaTermWindow;

/** Shared timeline: semester 5 matches the quota term, without fixed calendar years. */
final class DemoAcademicContext
{
    public static function terms(): \Illuminate\Support\Collection
    {
        $terms = app(QuotaTermWindow::class)->availableTerms();
        if ($terms->count() < 2) {
            throw new \RuntimeException('Seed at least two available academic terms before creating demo data.');
        }
        return $terms;
    }

    public static function internshipTerm(): AcademicSemester
    {
        return self::terms()->first();
    }

    public static function intake(): AcademicSemester
    {
        $id = AcademicSemester::intakeTermIdForInternship(self::internshipTerm()->id);
        if (!$id) {
            throw new \RuntimeException('The demo internship term needs four preceding study semesters.');
        }
        return AcademicSemester::findOrFail($id);
    }

    public static function currentSemester(): int
    {
        return min(5, max(1, AcademicSemester::whereDate('starts_on', '>=', self::intake()->starts_on->toDateString())
            ->whereDate('starts_on', '<=', now('Asia/Brunei')->toDateString())->count()));
    }
}
