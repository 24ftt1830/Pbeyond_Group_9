<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EvaluationTemplate;
use App\Models\EvaluationComponent;
use App\Models\FinalInternshipReport;
use App\Services\InternshipCompletionStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationTemplateController extends Controller
{
    public function index(): Response
    {
        $templates = EvaluationTemplate::with('sections.criteria.ratingLevels')
            ->whereIn('supervisor_type', ['Academic Supervisor', 'Industry Supervisor'])
            ->orderBy('supervisor_type')->orderByDesc('version')->get();
        $writtenReportTemplate = EvaluationTemplate::with('sections.criteria.ratingLevels')
            ->where('supervisor_type', 'Written Report')->orderByDesc('version')->first();

        $reports = FinalInternshipReport::with('student.programme', 'student.internshipCompletion')->latest('updated_at')->get()
            ->map(function (FinalInternshipReport $report) {
                $completion = $report->student?->internshipCompletion;

                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'submitted_at' => $report->submitted_at,
                    'academic_review_status' => $report->academic_review_status,
                    'industry_confirmation_status' => $completion?->industry_confirmation_status ?? 'Pending Confirmation',
                    'academic_completion_status' => $completion?->academic_completion_status ?? 'Pending Evaluation',
                    'completion_status' => app(InternshipCompletionStatus::class)->for($report->student, $report),
                    'report_score' => $report->report_score,
                    'overall_score' => app(InternshipCompletionStatus::class)->overallScore($report->student),
                    'student' => $report->student?->only(['student_id', 'full_name', 'pb_student_code']),
                ];
            });

        $componentWeights = EvaluationComponent::whereIn('component_key', [
            'academic_supervisor', 'industry_supervisor', 'student_written_report',
        ])->pluck('weight', 'component_key')->all();
        foreach ([
            'academic_supervisor' => 'Academic Supervisor',
            'industry_supervisor' => 'Industry Supervisor',
            'student_written_report' => null,
        ] as $key => $type) {
            if (!array_key_exists($key, $componentWeights)) {
                $componentWeights[$key] = $type
                    ? (EvaluationTemplate::where('supervisor_type', $type)->orderByDesc('version')->value('component_weight') ?? 0)
                    : 0;
            }
        }

        return Inertia::render('Admin/Evaluations', [
            'templates' => $templates,
            'writtenReportTemplate' => $writtenReportTemplate,
            'reports' => $reports,
            'studentWrittenReportWeight' => EvaluationComponent::where('component_key', 'student_written_report')->value('weight') ?? 0,
            'componentWeights' => $componentWeights,
        ]);
    }

    public function saveReportComponent(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'weights.academic_supervisor' => ['nullable', 'numeric', 'between:0,100'],
            'weights.industry_supervisor' => ['nullable', 'numeric', 'between:0,100'],
            'weights.student_written_report' => ['nullable', 'numeric', 'between:0,100'],
            'weight' => ['nullable', 'numeric', 'between:0,100'],
        ]);
        $weights = $data['weights'] ?? [];
        if (array_key_exists('weight', $data)) {
            $weights['student_written_report'] = $data['weight'];
        }
        $this->saveComponentWeights($weights);

        return back()->with('success', 'Evaluation component weight draft saved.');
    }

    public function saveWrittenReportTemplate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'weights.academic_supervisor' => ['nullable', 'numeric', 'between:0,100'],
            'weights.industry_supervisor' => ['nullable', 'numeric', 'between:0,100'],
            'weights.student_written_report' => ['nullable', 'numeric', 'between:0,100'],
            'sections' => ['required', 'array', 'size:1'],
            'sections.*.title' => ['nullable', 'string', 'max:150'],
            'sections.*.description' => ['nullable', 'string', 'max:2000'],
            'sections.*.weight' => ['nullable', 'numeric', 'between:0,100'],
            'sections.*.criteria' => ['required', 'array', 'min:1'],
            'sections.*.criteria.*.title' => ['nullable', 'string', 'max:150'],
            'sections.*.criteria.*.description' => ['nullable', 'string', 'max:2000'],
            'sections.*.criteria.*.levels' => ['required', 'array', 'min:1'],
            'sections.*.criteria.*.levels.*.title' => ['nullable', 'string', 'max:100'],
            'sections.*.criteria.*.levels.*.description' => ['nullable', 'string', 'max:2000'],
            'sections.*.criteria.*.levels.*.points' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ]);

        DB::transaction(function () use ($data) {
            $this->saveComponentWeights($data['weights'] ?? []);
            $version = ((int) EvaluationTemplate::where('supervisor_type', 'Written Report')->max('version')) + 1;
            $template = EvaluationTemplate::create([
                'supervisor_type' => 'Written Report',
                'name' => 'Student Written Report Rubric',
                'component_weight' => 100,
                'version' => $version,
                'is_active' => false,
            ]);

            foreach ($data['sections'] as $sectionIndex => $sectionData) {
                $section = $template->sections()->create([
                    'title' => $sectionData['title'] ?? '',
                    'description' => $sectionData['description'] ?? null,
                    'weight' => 100,
                    'sort_order' => $sectionIndex,
                ]);
                foreach ($sectionData['criteria'] as $criterionIndex => $criterionData) {
                    $criterion = $section->criteria()->create([
                        'title' => $criterionData['title'] ?? '',
                        'description' => $criterionData['description'] ?? null,
                        'sort_order' => $criterionIndex,
                    ]);
                    foreach ($criterionData['levels'] as $levelIndex => $levelData) {
                        $criterion->ratingLevels()->create([
                            'title' => $levelData['title'] ?? '',
                            'description' => $levelData['description'] ?? null,
                            'points' => $levelData['points'] ?? null,
                            'sort_order' => $levelIndex,
                        ]);
                    }
                }
            }
        });

        return back()->with('success', 'Written report rubric draft saved.');
    }

    public function activateAll(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'weights.academic_supervisor' => ['present', 'nullable', 'numeric', 'between:0,100'],
            'weights.industry_supervisor' => ['present', 'nullable', 'numeric', 'between:0,100'],
            'weights.student_written_report' => ['present', 'nullable', 'numeric', 'between:0,100'],
        ]);
        $templates = $this->latestSupervisorTemplates();
        $writtenReportTemplate = EvaluationTemplate::with('sections.criteria.ratingLevels')
            ->where('supervisor_type', 'Written Report')->orderByDesc('version')->first();
        $weights = array_map(fn ($weight) => is_numeric($weight) ? (float) $weight : 0.0, $data['weights']);
        $combinedWeight = array_sum(array_map('floatval', $weights));
        if (abs($combinedWeight - 100) > 0.001) {
            throw ValidationException::withMessages(['activation' => $this->activationWeightMessage($combinedWeight)]);
        }
        $templateErrors = $this->activationTemplateErrors($templates, $weights);
        if (!$writtenReportTemplate) {
            $templateErrors[] = 'Student Written Report grading rubric is missing. Save a complete rubric draft before activation.';
        } else {
            foreach ($this->writtenReportTemplateProblems($writtenReportTemplate) as $problem) {
                $templateErrors[] = 'Student Written Report rubric ' . $problem;
            }
        }
        if ($templateErrors !== []) {
            throw ValidationException::withMessages(['activation' => implode(' ', $templateErrors)]);
        }

        DB::transaction(function () use ($weights, $templates, $writtenReportTemplate) {
            $this->saveComponentWeights($weights, true);
            foreach ($templates as $template) {
                $key = $template->supervisor_type === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
                $template->update(['component_weight' => $weights[$key]]);
                EvaluationTemplate::where('supervisor_type', $template->supervisor_type)
                    ->where('id', '!=', $template->id)->update(['is_active' => false]);
                $template->update(['is_active' => true]);
            }
            EvaluationTemplate::where('supervisor_type', 'Written Report')
                ->where('id', '!=', $writtenReportTemplate->id)->update(['is_active' => false]);
            $writtenReportTemplate->update(['is_active' => true]);
        });

        return redirect()->route('admin.evaluations')->with('success', 'All evaluation components are active.');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        return $this->save($data, null);
    }

    public function update(Request $request, EvaluationTemplate $template): RedirectResponse
    {
        $data = $this->validated($request);
        abort_unless($data['supervisor_type'] === $template->supervisor_type, 422);
        return $this->save($data, $template);
    }

    private function save(array $data, ?EvaluationTemplate $template): RedirectResponse
    {
        $data['name'] = $data['supervisor_type'] . ' Evaluation';
        $data['component_weight'] = $data['component_weight'] ?? 0;
        $data['weights'] = array_map(fn ($weight) => is_numeric($weight) ? (float) $weight : 0.0, $data['weights'] ?? []);
        $sectionWeight = (float) collect($data['sections'])->sum('weight');
        $writtenReportTemplate = null;

        if ($data['is_active']) {
            $weights = $data['weights'] ?? [];
            $academicWeight = (float) ($weights['academic_supervisor'] ?? ($data['supervisor_type'] === 'Academic Supervisor' ? $data['component_weight'] : EvaluationComponent::where('component_key', 'academic_supervisor')->value('weight')));
            $industryWeight = (float) ($weights['industry_supervisor'] ?? ($data['supervisor_type'] === 'Industry Supervisor' ? $data['component_weight'] : EvaluationComponent::where('component_key', 'industry_supervisor')->value('weight')));
            $reportWeight = (float) ($weights['student_written_report'] ?? EvaluationComponent::where('component_key', 'student_written_report')->value('weight'));
            $combinedWeight = $academicWeight + $industryWeight + $reportWeight;
            if (abs($combinedWeight - 100) > 0.001) {
                throw ValidationException::withMessages(['activation' => $this->activationWeightMessage($combinedWeight)]);
            }
        }

        foreach ($data['sections'] as $index => $section) {
            $data['sections'][$index]['title'] = $section['title'] ?? '';
            if (count($section['criteria']) < 1) {
                throw ValidationException::withMessages(["sections.$index.criteria" => 'Each section needs at least one criterion.']);
            }
            foreach ($section['criteria'] as $criterionIndex => $criterion) {
                $data['sections'][$index]['criteria'][$criterionIndex]['title'] = $criterion['title'] ?? '';
                if (count($criterion['levels']) < 1) {
                    throw ValidationException::withMessages(["sections.$index.criteria.$criterionIndex.levels" => 'Each criterion needs at least one grading level.']);
                }
                foreach ($criterion['levels'] as $levelIndex => $level) {
                    $data['sections'][$index]['criteria'][$criterionIndex]['levels'][$levelIndex]['title'] = $level['title'] ?? '';
                }
                if ($data['is_active'] && (int) collect($criterion['levels'])->max('points') < 1) {
                    throw ValidationException::withMessages([
                        "sections.$index.criteria.$criterionIndex.levels" => 'At least one grading level for each criterion must have a point value above zero.',
                    ]);
                }
            }
        }

        if ($data['is_active']) {
            if (abs($sectionWeight - (float) $data['component_weight']) > 0.001) {
                throw ValidationException::withMessages([
                    'sections' => $data['supervisor_type'] . ' section weights must equal its component allocation of ' . $this->formatWeight((float) $data['component_weight']) . '%.',
                ]);
            }

            $otherType = $data['supervisor_type'] === 'Academic Supervisor' ? 'Industry Supervisor' : 'Academic Supervisor';
            $otherTemplate = EvaluationTemplate::with('sections.criteria.ratingLevels')
                ->where('supervisor_type', $otherType)->orderByDesc('version')->first();
            $weights = $data['weights'] ?? [];
            $otherComponentKey = $otherType === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
            $otherWeight = (float) ($weights[$otherComponentKey] ?? $otherTemplate?->component_weight ?? 0);
            if (!$otherTemplate || !$this->templateIsComplete($otherTemplate, $otherWeight)) {
                throw ValidationException::withMessages([
                    'activation' => $otherTemplate
                        ? implode(' ', $this->templateProblems($otherTemplate, $otherWeight))
                        : $otherType . ' evaluation template is missing. Save a complete template before activation.',
                ]);
            }

            $writtenReportTemplate = EvaluationTemplate::with('sections.criteria.ratingLevels')
                ->where('supervisor_type', 'Written Report')->orderByDesc('version')->first();
            if (!$writtenReportTemplate) {
                throw ValidationException::withMessages([
                    'activation' => 'Student Written Report grading rubric is missing. Save a complete rubric draft before activation.',
                ]);
            }
            $writtenReportProblems = $this->writtenReportTemplateProblems($writtenReportTemplate);
            if ($writtenReportProblems !== []) {
                throw ValidationException::withMessages([
                    'activation' => 'Student Written Report rubric ' . implode(' ', $writtenReportProblems),
                ]);
            }

        }

        DB::transaction(function () use ($data, $writtenReportTemplate) {
            $weights = $data['weights'] ?? [];
            if (!array_key_exists('academic_supervisor', $weights)) {
                $weights['academic_supervisor'] = $data['supervisor_type'] === 'Academic Supervisor'
                    ? $data['component_weight']
                    : (EvaluationComponent::where('component_key', 'academic_supervisor')->value('weight') ?? 0);
            }
            if (!array_key_exists('industry_supervisor', $weights)) {
                $weights['industry_supervisor'] = $data['supervisor_type'] === 'Industry Supervisor'
                    ? $data['component_weight']
                    : (EvaluationComponent::where('component_key', 'industry_supervisor')->value('weight') ?? 0);
            }
            if (!array_key_exists('student_written_report', $weights)) {
                $weights['student_written_report'] = EvaluationComponent::where('component_key', 'student_written_report')->value('weight') ?? 0;
            }
            $weights[$data['supervisor_type'] === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor'] = $data['component_weight'];
            $this->saveComponentWeights($weights);
            $version = ((int) EvaluationTemplate::where('supervisor_type', $data['supervisor_type'])->max('version')) + 1;
            $template = EvaluationTemplate::create([
                'supervisor_type' => $data['supervisor_type'], 'name' => $data['name'],
                'component_weight' => $data['component_weight'], 'version' => $version, 'is_active' => false,
            ]);

            if ($data['is_active']) {
                EvaluationTemplate::where('supervisor_type', $data['supervisor_type'])
                    ->where('id', '!=', $template->id)->update(['is_active' => false]);
            }

            foreach ($data['sections'] as $sectionIndex => $sectionData) {
                $section = $template->sections()->create([
                    'title' => $sectionData['title'], 'description' => $sectionData['description'] ?? null,
                    'weight' => $sectionData['weight'] ?? null, 'sort_order' => $sectionIndex,
                ]);
                foreach ($sectionData['criteria'] as $criterionIndex => $criterionData) {
                    $criterion = $section->criteria()->create([
                        'title' => $criterionData['title'], 'description' => $criterionData['description'] ?? null,
                        'sort_order' => $criterionIndex,
                    ]);
                    foreach ($criterionData['levels'] as $levelIndex => $levelData) {
                        $criterion->ratingLevels()->create([
                            'title' => $levelData['title'] ?? '',
                            'description' => $levelData['description'] ?? null,
                            'points' => $levelData['points'] ?? null,
                            'sort_order' => $levelIndex,
                        ]);
                    }
                }
            }
            $template->update(['is_active' => $data['is_active']]);

            if ($data['is_active']) {
                $this->saveComponentWeights($weights, true);
                foreach (['Academic Supervisor', 'Industry Supervisor'] as $type) {
                    $activeTemplate = $type === $template->supervisor_type
                        ? $template
                        : EvaluationTemplate::where('supervisor_type', $type)->orderByDesc('version')->firstOrFail();
                    $componentKey = $type === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
                    $activeTemplate->update(['component_weight' => $weights[$componentKey]]);
                    EvaluationTemplate::where('supervisor_type', $type)
                        ->where('id', '!=', $activeTemplate->id)->update(['is_active' => false]);
                    $activeTemplate->update(['is_active' => true]);
                }
                EvaluationTemplate::where('supervisor_type', 'Written Report')
                    ->where('id', '!=', $writtenReportTemplate->id)->update(['is_active' => false]);
                $writtenReportTemplate->update(['is_active' => true]);
            }
        });

        return redirect()->route('admin.evaluations')->with(
            'success',
            $data['is_active']
                ? 'PB Supervisor, Industry Supervisor, and Student Written Report evaluation components are active.'
                : 'Evaluation template draft saved.'
        );
    }

    private function validated(Request $request): array
    {
        $active = $request->boolean('is_active');
        return $request->validate([
            'supervisor_type' => ['required', 'in:Academic Supervisor,Industry Supervisor'],
            'is_active' => ['required', 'boolean'],
            'component_weight' => [$active ? 'required' : 'nullable', 'numeric', 'between:0,100'],
            'weights.academic_supervisor' => ['nullable', 'numeric', 'between:0,100'],
            'weights.industry_supervisor' => ['nullable', 'numeric', 'between:0,100'],
            'weights.student_written_report' => ['nullable', 'numeric', 'between:0,100'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.title' => [$active ? 'required' : 'nullable', 'string', 'max:150'],
            'sections.*.description' => ['nullable', 'string', 'max:2000'],
            'sections.*.weight' => [$active ? 'required' : 'nullable', 'numeric', 'between:0,100'],
            'sections.*.criteria' => ['required', 'array', 'min:1'],
            'sections.*.criteria.*.title' => [$active ? 'required' : 'nullable', 'string', 'max:150'],
            'sections.*.criteria.*.description' => ['nullable', 'string', 'max:2000'],
            'sections.*.criteria.*.levels' => ['required', 'array', 'min:1'],
            'sections.*.criteria.*.levels.*.title' => [$active ? 'required' : 'nullable', 'string', 'max:100'],
            'sections.*.criteria.*.levels.*.description' => [$active ? 'required' : 'nullable', 'string', 'max:2000'],
            'sections.*.criteria.*.levels.*.points' => [$active ? 'required' : 'nullable', 'integer', 'min:0', 'max:1000'],
        ]);
    }

    /** @param array<string, int|float|string|null> $weights */
    private function saveComponentWeights(array $weights, bool $activate = false): void
    {
        $names = [
            'academic_supervisor' => 'Academic Supervisor',
            'industry_supervisor' => 'Industry Supervisor',
            'student_written_report' => 'Student Written Report',
        ];
        foreach ($names as $key => $name) {
            if (!array_key_exists($key, $weights)) {
                continue;
            }
            $weight = is_numeric($weights[$key]) ? $weights[$key] : 0;
            $values = ['name' => $name, 'weight' => $weight];
            if ($activate) {
                $values['active_weight'] = $weight;
            }
            EvaluationComponent::updateOrCreate(['component_key' => $key], $values);
        }
    }

    private function activationWeightMessage(float $total): string
    {
        $formatted = rtrim(rtrim(number_format($total, 2, '.', ''), '0'), '.');
        return 'Cannot activate evaluation. Overall component weights must total exactly 100%. Current total: ' . $formatted . '%.';
    }

    private function templateIsComplete(EvaluationTemplate $template, float $componentAllocation): bool
    {
        return $this->templateProblems($template, $componentAllocation) === [];
    }

    /** @return list<string> */
    private function writtenReportTemplateProblems(EvaluationTemplate $template): array
    {
        if ($template->sections->count() !== 1) {
            return ['must contain exactly one section. Keep all written report criteria inside that section.'];
        }

        return $this->templateProblems($template, 100);
    }

    /** @return array<string, EvaluationTemplate> */
    private function latestSupervisorTemplates(): array
    {
        $templates = [];
        foreach (['Academic Supervisor', 'Industry Supervisor'] as $type) {
            $template = EvaluationTemplate::with('sections.criteria.ratingLevels')
                ->where('supervisor_type', $type)->orderByDesc('version')->first();
            if ($template) {
                $templates[$type] = $template;
            }
        }
        return $templates;
    }

    /** @param array<string, EvaluationTemplate> $templates
     *  @return list<string>
     */
    private function activationTemplateErrors(array $templates, array $weights): array
    {
        $types = ['Academic Supervisor', 'Industry Supervisor'];
        $missing = array_values(array_diff($types, array_keys($templates)));
        $errors = [];
        foreach ($missing as $type) {
            $errors[] = $type . ' evaluation template is missing. Save a complete template before activation.';
        }

        $sectionWeightProblems = [];
        $otherProblems = [];
        foreach ($templates as $type => $template) {
            $key = $type === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
            foreach ($this->templateProblems($template, (float) ($weights[$key] ?? 0)) as $problem) {
                if (str_contains($problem, 'section weights')) {
                    $sectionWeightProblems[$type] = $problem;
                } else {
                    $otherProblems[] = $type . ': ' . $problem;
                }
            }
        }

        if ($sectionWeightProblems !== []) {
            foreach ($sectionWeightProblems as $type => $problem) {
                $errors[] = $type . ' ' . $problem;
            }
        }
        array_push($errors, ...$otherProblems);

        return $errors;
    }

    /** @return list<string> */
    private function templateProblems(EvaluationTemplate $template, float $componentAllocation): array
    {
        $problems = [];
        if ($template->sections->isEmpty()) {
            return ['has no sections. Add at least one section.'];
        }

        $sectionWeight = 0.0;
        $invalidSectionWeight = false;
        $hasIncompleteFields = false;
        foreach ($template->sections as $section) {
            if ($section->weight === null || !is_numeric($section->weight) || (float) $section->weight < 0) {
                $invalidSectionWeight = true;
                $hasIncompleteFields = true;
            } else {
                $sectionWeight += (float) $section->weight;
            }
            if (blank(trim((string) $section->title)) || $section->criteria->isEmpty()) {
                $hasIncompleteFields = true;
            }

            foreach ($section->criteria as $criterion) {
                if (blank(trim((string) $criterion->title)) || $criterion->ratingLevels->isEmpty()) {
                    $hasIncompleteFields = true;
                }
                $maximum = 0;
                foreach ($criterion->ratingLevels as $level) {
                    if (blank(trim((string) $level->title)) || blank(trim((string) $level->description)) || $level->points === null) {
                        $hasIncompleteFields = true;
                    }
                    $maximum = max($maximum, (int) $level->points);
                }
                if ($maximum < 1) {
                    $hasIncompleteFields = true;
                }
            }
        }

        if ($invalidSectionWeight || abs($sectionWeight - $componentAllocation) > 0.001) {
            $problems[] = 'section weights total ' . $this->formatWeight($sectionWeight) . '%, and must equal the component allocation of ' . $this->formatWeight($componentAllocation) . '%.';
        }
        if ($hasIncompleteFields) {
            $problems[] = 'has incomplete section or grading-level fields. Complete each section, criterion, and rating level.';
        }
        return $problems;
    }

    private function formatWeight(float $weight): string
    {
        return rtrim(rtrim(number_format($weight, 2, '.', ''), '0'), '.');
    }
}
