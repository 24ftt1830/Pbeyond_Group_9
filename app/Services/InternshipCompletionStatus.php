<?php

namespace App\Services;

use App\Models\EvaluationSubmission;
use App\Models\EvaluationTemplate;
use App\Models\FinalInternshipReport;
use App\Models\IndustrySupervisor;
use App\Models\Student;

class InternshipCompletionStatus
{
    public function for(Student $student, ?FinalInternshipReport $report = null): string
    {
        $report ??= $student->finalInternshipReport;
        $completion = $student->internshipCompletion;

        if ($completion?->academic_completion_status === 'Completed'
            && $this->canAcademicFinalize($student, 'Completed', $report)) {
            return 'Completed';
        }

        if ($completion?->academic_completion_status === 'Incomplete'
            && $this->canAcademicFinalize($student, 'Incomplete', $report)) {
            return 'Incomplete';
        }

        return 'Pending Evaluation';
    }

    public function canAcademicFinalize(Student $student, string $decision, ?FinalInternshipReport $report = null): bool
    {
        $report ??= $student->finalInternshipReport;
        $completion = $student->internshipCompletion;
        $componentsReady = $this->components($student) !== null;
        $reportSubmitted = $report !== null && $report->submitted_at !== null && $report->pdf_path !== null;
        $industryDecisionMade = in_array($completion?->industry_confirmation_status, ['Confirmed', 'Changes Required'], true);

        if (!$reportSubmitted || !$industryDecisionMade || !$componentsReady) {
            return false;
        }

        if ($decision === 'Completed') {
            return $report->academic_review_status === 'Approved'
                && !$report->reopened_at
                && $report->report_score !== null
                && $report->report_component_weight_snapshot !== null
                && $completion?->industry_confirmation_status === 'Confirmed'
                && $this->overallScore($student) !== null;
        }

        return $decision === 'Incomplete'
            && !$report->reopened_at
            && in_array($report->academic_review_status, ['Approved', 'Changes Required'], true)
            && ($report->academic_review_status !== 'Approved'
                || ($report->report_score !== null && $report->report_component_weight_snapshot !== null));
    }

    public function overallScore(Student $student): ?float
    {
        $components = $this->components($student);
        if ($components === null) {
            return null;
        }

        $report = $student->finalInternshipReport;
        if (!$report?->submitted_at || !$report->pdf_path || $report->reopened_at || $report->academic_review_status !== 'Approved' || $report->report_score === null || $report->report_component_weight_snapshot === null) {
            return null;
        }

        $totalWeight = collect($components)->sum(fn ($component) => (float) data_get($component['submission']->template_snapshot, 'component_weight', $component['template']->component_weight))
            + (float) $report->report_component_weight_snapshot;
        if (abs($totalWeight - 100) > 0.001) {
            return null;
        }

        $supervisorScores = collect($components)->sum(function (array $component) {
            $weight = (float) data_get($component['submission']->template_snapshot, 'component_weight', $component['template']->component_weight);
            $sectionWeightTotal = collect(data_get($component['submission']->template_snapshot, 'sections', []))
                ->sum(fn ($section) => (float) data_get($section, 'weight', 0));

            // New templates store section weights as direct contributions. Older snapshots
            // used 100% section rubrics and applied the component weight afterwards.
            $scoreMultiplier = abs($sectionWeightTotal - $weight) <= 0.001 ? 1 : ($weight / 100);
            return (float) $component['submission']->overall_score * $scoreMultiplier;
        });

        return round($supervisorScores + ((float) $report->report_score * ((float) $report->report_component_weight_snapshot / 100)), 2);
    }

    private function components(Student $student): ?array
    {
        $templates = EvaluationTemplate::where('is_active', true)
            ->whereIn('supervisor_type', ['Academic Supervisor', 'Industry Supervisor'])
            ->get()->keyBy('supervisor_type');
        if ($templates->count() !== 2) {
            return null;
        }

        $academicSupervisorIds = $student->programme
            ? $student->programme->academicSupervisorAssignments()->pluck('academic_supervisor_id')
            : collect();
        $recruitedQuotaIds = $student->applications()->where('app_status', 'Recruited')->pluck('quota_id');
        $industrySupervisorIds = IndustrySupervisor::whereIn('quota_id', $recruitedQuotaIds)->pluck('supervisor_id');
        if ($academicSupervisorIds->isEmpty() || $industrySupervisorIds->isEmpty()) {
            return null;
        }

        $academic = EvaluationSubmission::where('supervisor_type', 'Academic Supervisor')
            ->where('student_id', $student->student_id)
            ->whereIn('academic_supervisor_id', $academicSupervisorIds)->latest('submitted_at')->latest('id')->first();
        $industry = EvaluationSubmission::where('supervisor_type', 'Industry Supervisor')
            ->where('student_id', $student->student_id)
            ->whereIn('industry_supervisor_id', $industrySupervisorIds)->latest('submitted_at')->latest('id')->first();
        if (!$academic || !$industry || $academic->reopened_at || $industry->reopened_at) {
            return null;
        }

        return [
            ['template' => $templates['Academic Supervisor'], 'submission' => $academic],
            ['template' => $templates['Industry Supervisor'], 'submission' => $industry],
        ];
    }
}
