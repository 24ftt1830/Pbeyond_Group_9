<?php

namespace Database\Seeders;

use App\Models\EvaluationComponent;
use App\Models\EvaluationTemplate;
use Illuminate\Database\Seeder;

class EvaluationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $examples = [
            'Academic Supervisor' => [
                'component_weight' => 40,
                'sections' => [
                    [
                        'title' => 'Professional Learning',
                        'description' => 'Application of academic knowledge and learning during the internship.',
                        'weight' => 25,
                        'criteria' => ['Application of Knowledge', 'Problem Solving and Initiative'],
                    ],
                    [
                        'title' => 'Reflection and Development',
                        'description' => 'Growth in skills, independence, and professional practice.',
                        'weight' => 15,
                        'criteria' => ['Learning and Reflection'],
                    ],
                ],
            ],
            'Industry Supervisor' => [
                'component_weight' => 40,
                'sections' => [
                    [
                        'title' => 'Work Performance',
                        'description' => 'Quality, accuracy, and timeliness of assigned work.',
                        'weight' => 25,
                        'criteria' => ['Quality of Work'],
                    ],
                    [
                        'title' => 'Workplace Conduct',
                        'description' => 'Communication, teamwork, responsibility, and workplace conduct.',
                        'weight' => 15,
                        'criteria' => ['Professional Conduct'],
                    ],
                ],
            ],
            'Written Report' => [
                'component_weight' => 100,
                'sections' => [
                    [
                        'title' => 'Written Report Assessment',
                        'description' => 'Assess the work completed, learning and reflection, and clarity of the final internship report.',
                        'weight' => 100,
                        'criteria' => [
                            'Analysis of Work and Outcomes',
                            'Reflection on Learning and Development',
                            'Language, Grammar, and Presentation',
                        ],
                    ],
                ],
            ],
        ];

        foreach ($examples as $supervisorType => $example) {
            $template = EvaluationTemplate::where('supervisor_type', $supervisorType)
                ->orderByDesc('version')
                ->first();

            if ($template) {
                // Published rubrics and assessment snapshots must remain unchanged.
                if ($template->is_active || $template->submissions()->exists()
                    || \App\Models\FinalInternshipReport::where('report_template_id', $template->id)->exists()) {
                    continue;
                }
                foreach ($example['sections'] as $sectionData) {
                    $section = $template->sections()->where('title', $sectionData['title'])->first();
                    if (!$section) {
                        continue;
                    }

                    foreach ($sectionData['criteria'] as $criterionOrder => $criterionTitle) {
                        if ($section->criteria()->where('title', $criterionTitle)->exists()) {
                            continue;
                        }

                        $emptyCriterion = $section->criteria()
                            ->where(fn ($query) => $query->whereNull('title')->orWhere('title', ''))
                            ->with('ratingLevels')
                            ->get()
                            ->first(fn ($candidate) => blank($candidate->description)
                                && $candidate->ratingLevels->every(fn ($level) => blank($level->title)
                                    && blank($level->description)
                                    && $level->points === null));

                        if ($emptyCriterion) {
                            $emptyCriterion->update([
                                'title' => $criterionTitle,
                                'description' => 'Assess the student’s performance against this criterion.',
                                'sort_order' => $criterionOrder,
                            ]);
                            $emptyCriterion->ratingLevels()->delete();
                            $criterion = $emptyCriterion;
                        } else {
                            $criterion = $section->criteria()->create([
                                'title' => $criterionTitle,
                                'description' => 'Assess the student’s performance against this criterion.',
                                'sort_order' => $criterionOrder,
                            ]);
                        }

                        foreach ($this->ratingLevels() as $levelOrder => $level) {
                            $criterion->ratingLevels()->create($level + ['sort_order' => $levelOrder]);
                        }
                    }
                }

                continue;
            }

            $template = EvaluationTemplate::create([
                'supervisor_type' => $supervisorType,
                'name' => $supervisorType . ' Evaluation',
                'component_weight' => $example['component_weight'],
                'version' => 1,
                'is_active' => false,
            ]);

            foreach ($example['sections'] as $sectionOrder => $sectionData) {
                $section = $template->sections()->create([
                    'title' => $sectionData['title'],
                    'description' => $sectionData['description'],
                    'weight' => $sectionData['weight'],
                    'sort_order' => $sectionOrder,
                ]);

                foreach ($sectionData['criteria'] as $criterionOrder => $criterionTitle) {
                    $criterion = $section->criteria()->create([
                        'title' => $criterionTitle,
                        'description' => 'Assess the student’s performance against this criterion.',
                        'sort_order' => $criterionOrder,
                    ]);

                    foreach ($this->ratingLevels() as $levelOrder => $level) {
                        $criterion->ratingLevels()->create($level + ['sort_order' => $levelOrder]);
                    }
                }
            }
        }

        foreach ([
            'academic_supervisor' => ['Academic Supervisor', 40],
            'industry_supervisor' => ['Industry Supervisor', 40],
            'student_written_report' => ['Student Written Report', 20],
        ] as $key => [$name, $weight]) {
            EvaluationComponent::firstOrCreate(
                ['component_key' => $key],
                ['name' => $name, 'weight' => $weight, 'active_weight' => $weight]
            );
        }
    }

    private function ratingLevels(): array
    {
        return [
            ['title' => 'Needs Improvement', 'description' => 'Performance is below expectations and requires substantial guidance.', 'points' => 1],
            ['title' => 'Developing', 'description' => 'Performance is improving but remains inconsistent.', 'points' => 2],
            ['title' => 'Competent', 'description' => 'Performance meets the expected standard with occasional guidance.', 'points' => 3],
            ['title' => 'Exemplary', 'description' => 'Performance consistently exceeds expectations and shows initiative.', 'points' => 4],
        ];
    }
}
