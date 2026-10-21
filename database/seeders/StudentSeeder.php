<?php

namespace Database\Seeders;

use App\Models\Student;
use Database\Seeders\Support\DemoAcademicContext;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $intakeSemester = DemoAcademicContext::intake();
        $currentSemester = DemoAcademicContext::currentSemester();
        $projectStart = $intakeSemester->starts_on->copy()->addMonths(6)->toDateString();
        $projectEnd = $intakeSemester->starts_on->copy()->addMonths(10)->endOfMonth()->toDateString();

        $students = [
            [
                'code' => '24FTT001', 'name' => 'Ahmad Haziq Bin Rahman',
                'programme' => 'Level 5 Diploma in Web Technology', 'ic' => '01-123456', 'ic_colour' => 'Yellow',
                'dob' => '2003-05-10', 'birthplace' => 'RIPAS Hospital', 'gender' => 'Male', 'religion' => 'Islam',
                'nationality' => 'Bruneian', 'race' => 'Malay', 'phone' => '87341234', 'emergency' => '87654321',
                'address' => 'No. 123, Jalan Gadong, Bandar Seri Begawan', 'cgpa' => 2.40,
                'professional_profile' => 'Motivated web technology student with a foundation in responsive design and application development. Interested in building accessible, reliable web experiences.',
                'education' => ['Politeknik Brunei', 'Level 5 Diploma', 'Web Technology'],
                'skills' => ['HTML and CSS', 'JavaScript', 'PHP', 'Responsive Web Design'],
                'languages' => ['English', 'Malay'],
                'experience' => ['Gadong Mall', 'Part-time Retail Assistant', '2023-06-01', '2023-12-31', 'Assisted customers, handled point-of-sale transactions, and maintained daily stock records.'],
                'project' => ['Student Portfolio Website', 'Designed and built a responsive portfolio site to present coursework and projects.', 'HTML, CSS, JavaScript'],
                'activity' => ['Computing Club', 'Member', 'Participated in peer coding sessions and student technology events.'],
                'achievement' => ['Web Design Coursework Award', 'Recognised for a well-structured and accessible course project.', 'Politeknik Brunei'],
            ],
            [
                'code' => '24FTT002', 'name' => 'Sarah Binti Ali',
                'programme' => 'Level 5 Diploma in Application Development', 'ic' => '01-654321', 'ic_colour' => 'Red',
                'dob' => '2003-08-15', 'birthplace' => 'Pengiran Isteri Hajah Mariam Hospital', 'gender' => 'Female', 'religion' => 'Islam',
                'nationality' => 'Bruneian', 'race' => 'Malay', 'phone' => '88765432', 'emergency' => '87651234',
                'address' => 'No. 45, Spg 32, Jalan Muara, Brunei Darussalam', 'cgpa' => 2.30,
                'professional_profile' => 'Application development student interested in designing practical software solutions. Builds skills in programming, teamwork, and structured problem solving.',
                'education' => ['Politeknik Brunei', 'Level 5 Diploma', 'Application Development'],
                'skills' => ['Java', 'Database Design', 'Git', 'UI Prototyping'],
                'languages' => ['English', 'Malay'],
                'experience' => ['Student Application Project', 'Developer', '2025-01-15', '2025-05-30', 'Worked with a small team to plan, build, and document a prototype application.'],
                'project' => ['Campus Event Planner', 'Created an application prototype for browsing campus events and managing registrations.', 'Java, MySQL, Figma'],
                'activity' => ['Peer Tutoring Group', 'Volunteer Tutor', 'Helped classmates review introductory programming concepts.'],
                'achievement' => ['Application Development Project', 'Completed a documented team application project as part of the diploma coursework.', 'Politeknik Brunei'],
            ],
            [
                'code' => '24FTT003', 'name' => 'John Lim Wei Meng',
                'programme' => 'Level 5 Diploma in Data Analytics', 'ic' => '01-999888', 'ic_colour' => 'Purple',
                'dob' => '2002-11-20', 'birthplace' => 'Gleneagles JPMC', 'gender' => 'Male', 'religion' => 'Buddhist',
                'nationality' => 'Bruneian', 'race' => 'Chinese', 'phone' => '89887766', 'emergency' => '87659876',
                'address' => 'No. 78, Jalan Kiulap, Bandar Seri Begawan', 'cgpa' => 2.75,
                'professional_profile' => 'Data analytics student with experience cleaning datasets and presenting findings. Keen to apply analytical and communication skills to business problems.',
                'education' => ['Politeknik Brunei', 'Level 5 Diploma', 'Data Analytics'],
                'skills' => ['SQL', 'Python', 'Microsoft Excel', 'Data Visualization'],
                'languages' => ['English', 'Mandarin', 'Malay'],
                'experience' => ['TelBru', 'Summer Intern', '2023-06-01', '2023-08-31', 'Supported the team with spreadsheet updates, basic data checks, and administrative tasks.'],
                'project' => ['Retail Sales Dashboard', 'Prepared a dashboard summarising sample sales trends and product performance.', 'Python, Pandas, Power BI'],
                'activity' => ['Data Science Study Group', 'Member', 'Shared practice exercises and reviewed data visualization techniques.'],
                'achievement' => ['Data Analytics Capstone', 'Presented a data-backed recommendation as part of a capstone project.', 'Politeknik Brunei'],
            ],
            [
                'code' => '24FTB001', 'name' => 'Nurul Aisyah Binti Hassan',
                'programme' => 'Level 5 Diploma in Accounting', 'ic' => '02-456789', 'ic_colour' => 'Yellow',
                'dob' => '2003-02-20', 'birthplace' => 'RIPAS Hospital', 'gender' => 'Female', 'religion' => 'Islam',
                'nationality' => 'Bruneian', 'race' => 'Malay', 'phone' => '88771234', 'emergency' => '87659876',
                'address' => 'No. 67, Kampong Kiulap, Brunei Darussalam', 'cgpa' => 3.00,
                'professional_profile' => 'Accounting student with careful record-keeping and communication skills. Interested in supporting finance teams with accurate, organised work.',
                'education' => ['Politeknik Brunei', 'Level 5 Diploma', 'Accounting'],
                'skills' => ['Bookkeeping', 'Microsoft Excel', 'Financial Reporting', 'Attention to Detail'],
                'languages' => ['English', 'Malay'],
                'experience' => ['Bank Islam Brunei Darussalam', 'Part-time Administrative Assistant', '2024-01-10', '2024-06-30', 'Organised documents and assisted with routine administrative record keeping.'],
                'project' => ['Small Business Budget', 'Prepared a sample operating budget and summarised monthly variances.', 'Microsoft Excel'],
                'activity' => ['Student Business Society', 'Committee Member', 'Helped coordinate student talks and networking activities.'],
                'achievement' => ['Accounting Practice Project', 'Completed a sample bookkeeping and reporting exercise with supporting documentation.', 'Politeknik Brunei'],
            ],
            [
                'code' => '24FTB002', 'name' => 'Mohammad Faiz Bin Osman',
                'programme' => 'Level 5 Diploma in Human Resource Management', 'ic' => '02-789123', 'ic_colour' => 'Red',
                'dob' => '2003-07-11', 'birthplace' => 'Tutong Hospital', 'gender' => 'Male', 'religion' => 'Islam',
                'nationality' => 'Bruneian', 'race' => 'Malay', 'phone' => '89882345', 'emergency' => '87771234',
                'address' => 'No. 89, Jalan Tutong, Brunei Darussalam', 'cgpa' => 3.00,
                'professional_profile' => 'Human resource management student interested in recruitment, employee support, and workplace communication. Reliable and organised in team settings.',
                'education' => ['Politeknik Brunei', 'Level 5 Diploma', 'Human Resource Management'],
                'skills' => ['Recruitment Administration', 'Microsoft Office', 'Document Management', 'Communication'],
                'languages' => ['English', 'Malay'],
                'experience' => ['Politeknik Brunei Student Office', 'Administrative Support Volunteer', '2024-02-01', '2024-05-31', 'Helped organise forms and prepare materials for student activities.'],
                'project' => ['Recruitment Process Review', 'Mapped a sample recruitment process and suggested ways to improve candidate communication.', 'Microsoft Word, Microsoft PowerPoint'],
                'activity' => ['Volunteer Student Team', 'Volunteer', 'Supported student orientation and campus event setup.'],
                'achievement' => ['HR Case Study Presentation', 'Presented a team case study on fair and consistent recruitment practices.', 'Politeknik Brunei'],
            ],
            [
                'code' => '24FTE001', 'name' => 'Lim Wei Jie',
                'programme' => 'Level 5 Diploma in Mechanical Engineering', 'ic' => '03-567890', 'ic_colour' => 'Purple',
                'dob' => '2002-12-05', 'birthplace' => 'Jerudong Park Medical Centre', 'gender' => 'Male', 'religion' => 'Buddhist',
                'nationality' => 'Bruneian', 'race' => 'Chinese', 'phone' => '89772345', 'emergency' => '87652345',
                'address' => 'No. 234, Jalan Berakas, Brunei Darussalam', 'cgpa' => 2.60,
                'professional_profile' => 'Mechanical engineering student with an interest in maintenance, workshop practice, and technical documentation. Focused on safety and practical problem solving.',
                'education' => ['Politeknik Brunei', 'Level 5 Diploma', 'Mechanical Engineering'],
                'skills' => ['Technical Drawing', 'Workshop Safety', 'CAD Fundamentals', 'Maintenance Documentation'],
                'languages' => ['English', 'Mandarin', 'Malay'],
                'experience' => ['Shell Brunei Workshop', 'Workshop Assistant', '2024-06-01', '2024-08-31', 'Assisted with workshop preparation, tool organisation, and basic maintenance documentation.'],
                'project' => ['Pump Maintenance Study', 'Prepared a maintenance checklist and component overview for a training pump assembly.', 'CAD, Technical Documentation'],
                'activity' => ['Engineering Society', 'Member', 'Joined engineering talks and practical skills sessions.'],
                'achievement' => ['Workshop Safety Certificate', 'Completed a workshop safety and equipment handling course.', 'Politeknik Brunei'],
            ],
            [
                'code' => '24FTH001', 'name' => 'Siti Nurhaliza Binti Abdullah',
                'programme' => 'Level 5 Diploma in Nursing', 'ic' => '04-345678', 'ic_colour' => 'Yellow',
                'dob' => '2003-03-15', 'birthplace' => 'Pengiran Isteri Hajah Mariam Hospital', 'gender' => 'Female', 'religion' => 'Islam',
                'nationality' => 'Bruneian', 'race' => 'Malay', 'phone' => '88774567', 'emergency' => '87653456',
                'address' => 'No. 56, Kampong Ayer, Brunei Darussalam', 'cgpa' => 2.50,
                'professional_profile' => 'Nursing student committed to respectful, patient-centred care. Developing skills in communication, teamwork, and safe clinical practice.',
                'education' => ['Politeknik Brunei', 'Level 5 Diploma', 'Nursing'],
                'skills' => ['Patient Communication', 'Infection Prevention', 'First Aid', 'Clinical Documentation'],
                'languages' => ['English', 'Malay'],
                'experience' => ['RIPAS Hospital', 'Community Volunteer', '2023-07-01', '2023-09-30', 'Supported non-clinical volunteer activities and helped direct visitors to service areas.'],
                'project' => ['Community Health Awareness', 'Developed an educational poster and presentation about everyday health and wellbeing.', 'Health Education, Presentation'],
                'activity' => ['Community Health Volunteer Team', 'Volunteer', 'Participated in community wellbeing and health awareness events.'],
                'achievement' => ['First Aid Training', 'Completed introductory first aid training as part of student development.', 'Politeknik Brunei'],
            ],
        ];

        foreach ($students as $index => $data) {
            $existing = Student::where('pb_student_code', $data['code'])->first();
            if ($existing && ($existing->applications()->exists() || $existing->internship()->exists())) {
                // Reseeding must not move students who already began their placement workflow.
                continue;
            }
            $userId = DB::table('users')->where('username', $data['code'])->value('user_id');
            $programmeId = DB::table('programmes')->where('programme_name', $data['programme'])->value('programme_id');
            if (!$userId || !$programmeId) {
                continue;
            }

            $photoPath = 'passport_photos/' . $data['code'] . '.svg';
            Storage::disk('public')->put($photoPath, $this->placeholderPhoto($data['name']));

            DB::table('students')->updateOrInsert(
                ['pb_student_code' => $data['code']],
                [
                    'user_id' => $userId,
                    'full_name' => $data['name'],
                    'ic_number' => $data['ic'],
                    'ic_colour' => $data['ic_colour'],
                    'programme_id' => $programmeId,
                    'intake_session' => $intakeSemester->name,
                    'intake_semester_id' => $intakeSemester->id,
                    'current_semester' => $currentSemester,
                    'postal_address' => $data['address'],
                    'date_of_birth' => $data['dob'],
                    'place_of_birth' => $data['birthplace'],
                    'gender' => $data['gender'],
                    'religion' => $data['religion'],
                    'nationality' => $data['nationality'],
                    'race' => $data['race'],
                    'mobile_phone' => $data['phone'],
                    'cgpa' => $data['cgpa'],
                    'work_experience' => $data['experience'][4],
                    'emergency_no' => $data['emergency'],
                    'emergency_no_2' => '86'.str_pad((string) ($index + 1), 6, '0', STR_PAD_LEFT),
                    'district' => str_contains($data['address'], 'Tutong') ? 'Tutong' : 'Brunei-Muara',
                    'passport_photo_path' => $existing?->passport_photo_path ?: $photoPath,
                    'cv_snapshot' => null,
                    'cv_generated_at' => null,
                    'vetting_status' => 'Approved',
                    'updated_at' => now(),
                    'created_at' => $existing?->created_at ?? now(),
                ]
            );

            $studentId = DB::table('students')->where('pb_student_code', $data['code'])->value('student_id');
            $this->upsertOne('professional_profile', $studentId, [
                'profile' => $data['professional_profile'], 'active' => true,
            ]);
            $this->upsertOne('education', $studentId, [
                'institution' => $data['education'][0], 'qualification' => $data['education'][1],
                'field_of_study' => $data['education'][2], 'start_date' => $intakeSemester->starts_on->toDateString(),
                'end_date' => null, 'description' => 'Currently completing the programme.', 'active' => true,
            ]);
            $this->upsertOne('work_experiences', $studentId, [
                'company' => $data['experience'][0], 'position' => $data['experience'][1],
                'start_date' => $data['experience'][2], 'end_date' => $data['experience'][3],
                'description' => $data['experience'][4], 'active' => true,
            ]);
            $this->upsertOne('projects', $studentId, [
                'title' => $data['project'][0], 'description' => $data['project'][1],
                'technologies' => $data['project'][2], 'project_url' => null,
                'start_date' => $projectStart, 'end_date' => $projectEnd, 'active' => true,
            ]);
            $this->upsertOne('activities', $studentId, [
                'title' => $data['activity'][0], 'role' => $data['activity'][1],
                'description' => $data['activity'][2], 'start_date' => $intakeSemester->starts_on->copy()->addMonths(2)->toDateString(),
                'end_date' => $projectEnd, 'active' => true,
            ]);
            $this->upsertOne('achievements', $studentId, [
                'title' => $data['achievement'][0], 'description' => $data['achievement'][1],
                'issuer' => $data['achievement'][2], 'achievement_date' => $projectEnd, 'active' => true,
            ]);
            $this->upsertOne('referees', $studentId, [
                'name' => 'Programme Lecturer ' . ($index + 1), 'position' => 'Lecturer',
                'organization' => 'Politeknik Brunei', 'email' => 'referee' . ($index + 1) . '@pb.edu.bn',
                'phone' => '245' . str_pad((string) ($index + 1), 5, '0', STR_PAD_LEFT), 'active' => true,
            ]);
            $this->upsertOne('soft_skills', $studentId, [
                'skill' => 'Teamwork', 'description' => 'Collaborates respectfully and contributes to shared tasks.', 'active' => true,
            ]);
            $this->upsertNames('student_skills', $studentId, 'skill_name', $data['skills']);
            $this->upsertNames('student_languages', $studentId, 'language_name', $data['languages']);
        }
    }

    private function upsertOne(string $table, int $studentId, array $values): void
    {
        DB::table($table)->updateOrInsert(
            ['student_id' => $studentId],
            [...$values, 'updated_at' => now(), 'created_at' => now()]
        );
    }

    private function upsertNames(string $table, int $studentId, string $column, array $names): void
    {
        foreach ($names as $name) {
            DB::table($table)->updateOrInsert(
                ['student_id' => $studentId, $column => $name],
                ['student_id' => $studentId, $column => $name]
            );
        }
    }

    private function placeholderPhoto(string $name): string
    {
        $initials = collect(explode(' ', $name))
            ->filter()
            ->take(2)
            ->map(fn ($part) => mb_substr($part, 0, 1))
            ->implode('');
        $safeInitials = htmlspecialchars($initials, ENT_QUOTES | ENT_XML1, 'UTF-8');

        return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">'
            . '<rect width="400" height="500" fill="#e8eef5"/>'
            . '<circle cx="200" cy="175" r="82" fill="#a8b8ca"/>'
            . '<path d="M55 470c10-105 64-160 145-160s135 55 145 160" fill="#a8b8ca"/>'
            . '<text x="200" y="430" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#334155">'
            . $safeInitials . '</text></svg>';
    }
}
