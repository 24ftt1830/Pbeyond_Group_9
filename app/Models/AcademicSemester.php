<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicSemester extends Model
{
    protected $appends = ['company_label', 'quota_deadline', 'quota_deadline_label', 'show_quota_deadline'];

    public function getCompanyLabelAttribute(): string
    {
        return $this->starts_on?->format('F Y') ?? preg_replace('/\s*·.*$/u', '', $this->name ?? '');
    }

    public function getQuotaDeadlineAttribute(): ?string
    {
        return $this->starts_on?->copy()->endOfMonth()->toDateString();
    }

    public function getQuotaDeadlineLabelAttribute(): ?string
    {
        return $this->starts_on?->copy()->endOfMonth()->format('j M Y');
    }

    public function getShowQuotaDeadlineAttribute(): bool
    {
        return $this->starts_on?->format('Y-m') === \Illuminate\Support\Carbon::now('Asia/Brunei')->format('Y-m');
    }

    public static function sessionName(int $year, bool $july): string
    {
        $intake = $year - ($july ? 2010 : 2011);
        return ($july ? 'July ' : 'January ') . $year . ' · Intake ' . $intake;
    }

    protected $fillable = ['name', 'starts_on', 'ends_on'];

    protected $casts = [
        'starts_on' => 'date',
        'ends_on' => 'date',
    ];

    public function intakeStudents()
    {
        return $this->hasMany(Student::class, 'intake_semester_id');
    }

    public function placementQuotas()
    {
        return $this->hasMany(PlacementQuota::class, 'academic_semester_id');
    }

    /**
     * Return the target internship term for a student's intake. The intake
     * term is semester 1, so semester 5 is four terms after it.
     */
    public static function internshipTermIdForIntake(?int $intakeSemesterId): ?int
    {
        return static::internshipTermForIntake($intakeSemesterId)?->id;
    }

    public static function internshipTermForIntake(?int $intakeSemesterId): ?self
    {
        return static::termAtOffset($intakeSemesterId, 4);
    }

    /** Return the intake term for students entering internship in this term. */
    public static function intakeTermIdForInternship(?int $internshipSemesterId): ?int
    {
        return static::termAtOffset($internshipSemesterId, -4)?->id;
    }

    private static function termAtOffset(?int $semesterId, int $offset): ?self
    {
        if (!$semesterId) {
            return null;
        }

        $terms = static::query()->orderBy('starts_on')->orderBy('id')->get(['id', 'name', 'starts_on', 'ends_on']);
        $index = $terms->search(fn (self $term) => (int) $term->id === $semesterId);

        if ($index === false) {
            return null;
        }

        return $terms->get($index + $offset);
    }
}
