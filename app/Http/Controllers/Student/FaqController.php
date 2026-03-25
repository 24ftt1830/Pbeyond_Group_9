<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = [
            ['id' => '1', 'question' => 'What is PBeyond?', 'answer' => 'PBeyond is a platform designed to help students find and apply for internships, track their applications, and manage their internship experience.'],
            ['id' => '2', 'question' => 'What is the application deadline?', 'answer' => 'Application deadlines vary by company. Please check each company\'s listing for their specific deadline dates.'],
            ['id' => '3', 'question' => 'How can I track my application status?', 'answer' => 'You can track your application status in the Application Tracking page.'],
            ['id' => '4', 'question' => 'Can I add companies to my favorites?', 'answer' => 'Yes! You can add companies to your favorites by clicking the heart icon on any company listing.'],
            ['id' => '5', 'question' => 'How do I report an issue with my internship?', 'answer' => 'You can report any issues by navigating to the Report Issue page.'],
            ['id' => '6', 'question' => 'Is there a calendar for important dates?', 'answer' => 'Yes, we have a Calendar feature that displays important dates and events.'],
            ['id' => '7', 'question' => 'Do students get paid for their internships?', 'answer' => 'Yes, students are typically paid for their internships. Payment amounts vary by company and position.'],
        ];

        return Inertia::render('Student/FAQs', ['faqs' => $faqs]);
    }
}
