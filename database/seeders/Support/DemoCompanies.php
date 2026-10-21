<?php

namespace Database\Seeders\Support;

/** Illustrative organisations and positions covering all four schools. */
final class DemoCompanies
{
    public static function all(): array
    {
        return [
            [
                'name' => 'TechCorp Brunei', 'sector' => 'IT Services', 'school' => 'SICT',
                'district' => 'Brunei-Muara', 'address' => 'Unit 12-15, Technology Park, Gadong, Bandar Seri Begawan',
                'hr' => ['username' => 'techcorp_hr', 'email' => 'hr@techcorp.com'],
                'branch' => ['name' => 'Tutong Branch', 'district' => 'Tutong', 'address' => 'Jalan Tutong, Pekan Tutong'],
                'jobs' => [
                    ['title' => 'Data Analyst Intern', 'programme' => 'Data Analytics', 'skills' => ['SQL', 'Data analysis', 'Excel']],
                    ['title' => 'Web Developer Intern', 'programme' => 'Web Technology', 'skills' => ['PHP', 'JavaScript', 'Web development']],
                    ['title' => 'Application Developer Intern', 'programme' => 'Application Development', 'skills' => ['Java', 'Database design', 'Git']],
                ],
            ],
            [
                'name' => 'GlobalTech Solutions', 'sector' => 'Software Development', 'school' => 'SICT',
                'district' => 'Overseas', 'address' => 'Level 20, Marina Bay Financial Centre, Singapore',
                'hr' => ['username' => 'globaltech_hr', 'email' => 'hr@globaltech.com'],
                'branch' => ['name' => 'Jurong Branch', 'district' => 'Overseas', 'address' => 'Jurong East, Singapore'],
                'jobs' => [
                    ['title' => 'Frontend Developer Intern', 'programme' => 'Web Technology', 'skills' => ['JavaScript', 'React', 'CSS']],
                    ['title' => 'Junior Software Developer Intern', 'programme' => 'Application Development', 'skills' => ['Application development', 'Problem solving', 'Teamwork']],
                    ['title' => 'Junior Data Scientist', 'programme' => 'Data Analytics', 'skills' => ['Python', 'Data visualization', 'Statistics']],
                ],
            ],
            [
                'name' => 'DataTech Analytics', 'sector' => 'Data Analytics', 'school' => 'SICT',
                'district' => 'Brunei-Muara', 'address' => 'No. 45, Jalan Sultan, Bandar Seri Begawan',
                'hr' => ['username' => 'datatech_hr', 'email' => 'hr@datatech.com.bn'],
                'branch' => ['name' => 'Kuala Belait Branch', 'district' => 'Belait', 'address' => 'Jalan McKerron, Kuala Belait'],
                'jobs' => [
                    ['title' => 'Reporting Analyst Intern', 'programme' => 'Data Analytics', 'skills' => ['SQL', 'Excel', 'Reporting']],
                    ['title' => 'Business Intelligence Intern', 'programme' => 'Data Analytics', 'skills' => ['Power BI', 'Python', 'Data visualization']],
                    ['title' => 'Database Support Intern', 'programme' => 'Application Development', 'skills' => ['SQL', 'Database design', 'Documentation']],
                ],
            ],
            [
                'name' => 'Brunei Shell Petroleum', 'sector' => 'Oil & Gas', 'school' => 'SSE',
                'district' => 'Belait', 'address' => 'Panaga, Seria, Belait',
                'hr' => ['username' => 'shell_hr', 'email' => 'hr@shell.com.bn'],
                'branch' => ['name' => 'Kuala Belait Office', 'district' => 'Belait', 'address' => 'Kuala Belait, Belait'],
                'jobs' => [
                    ['title' => 'Mechanical Engineering Intern', 'programme' => 'Mechanical Engineering', 'skills' => ['CAD', 'Workshop safety', 'Maintenance']],
                    ['title' => 'Electrical Engineering Intern', 'programme' => 'Electrical Engineering', 'skills' => ['Circuits', 'Technical drawing', 'Safety']],
                    ['title' => 'Technical Documentation Intern', 'programme' => 'Petroleum Engineering', 'skills' => ['Technical writing', 'Excel', 'Documentation']],
                ],
            ],
            [
                'name' => 'Brunei Business Services', 'sector' => 'Business Services', 'school' => 'SBA',
                'district' => 'Brunei-Muara', 'address' => 'Kiulap, Bandar Seri Begawan',
                'hr' => ['username' => 'business_hr', 'email' => 'hr@business.example'],
                'branch' => ['name' => 'Tutong Office', 'district' => 'Tutong', 'address' => 'Pekan Tutong, Tutong'],
                'jobs' => [
                    ['title' => 'Accounting Intern', 'programme' => 'Accounting', 'skills' => ['Bookkeeping', 'Excel', 'Financial reporting']],
                    ['title' => 'HR Administration Intern', 'programme' => 'Human Resource Management', 'skills' => ['Communication', 'Document management', 'Microsoft Office']],
                    ['title' => 'Marketing Intern', 'programme' => 'Marketing', 'skills' => ['Content planning', 'Social media', 'Presentation']],
                ],
            ],
            [
                'name' => 'CarePlus Health Services', 'sector' => 'Healthcare', 'school' => 'SHS',
                'district' => 'Brunei-Muara', 'address' => 'Berakas, Bandar Seri Begawan',
                'hr' => ['username' => 'careplus_hr', 'email' => 'hr@careplus.example'],
                'branch' => ['name' => 'Temburong Centre', 'district' => 'Temburong', 'address' => 'Bangar, Temburong'],
                'jobs' => [
                    ['title' => 'Nursing Intern', 'programme' => 'Nursing', 'skills' => ['Patient communication', 'First aid', 'Infection prevention']],
                    ['title' => 'Clinical Records Intern', 'programme' => 'Midwifery', 'skills' => ['Documentation', 'Confidentiality', 'Communication']],
                    ['title' => 'Community Health Intern', 'programme' => 'Paramedic Science', 'skills' => ['Health education', 'Teamwork', 'First aid']],
                ],
            ],
        ];
    }
}
