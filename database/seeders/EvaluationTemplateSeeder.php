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
                        'criteria' => ['Application of Knowledge'],
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
                        'description' => 'Assess the content, understanding, analysis, reflection, structure, research, referencing, writing, and presentation of the final internship report.',
                        'weight' => 100,
                        'criteria' => [
                            'Report Objectives and Scope',
                            'Understanding of the Organization and Role',
                            'Analysis of Work and Outcomes',
                            'Reflection on Learning and Development',
                            'Organization and Flow',
                            'Use of Supporting Material',
                            'Use of Evidence and Sources',
                            'Citation and Referencing',
                            'Language, Grammar, and Presentation',
                        ],
                    ],
                ],
            ],
        ];

        foreach ($examples as $supervisorType => $example) {
            if (EvaluationTemplate::where('supervisor_type', $supervisorType)->exists()) {
                continue;
            }

            $template = EvaluationTemplate::create([
                'supervisor_type' => $supervisorType,
                'name' => $supervisorType . ' Evaluation',
                'component_weight' => $example['component_weight'],
                'version' => 1,
                'is_active' => true,
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
