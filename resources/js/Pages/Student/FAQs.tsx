import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export default function FAQs() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const faqs = [
        {
            id: '1',
            question: 'What is PBeyond?',
            answer: 'PBeyond is a platform designed to help students find and apply for internships, track their applications, and manage their internship experience.',
        },
        {
            id: '2',
            question: 'What is the application deadline?',
            answer: 'Application deadlines vary by company. Please check each company\'s listing for their specific deadline dates.',
        },
        {
            id: '3',
            question: 'How can I track my application status?',
            answer: 'You can track your application status in the Application Tracking page. It will show you the current status of all your submitted applications.',
        },
        {
            id: '4',
            question: 'Can I add companies to my favorites?',
            answer: 'Yes! You can add companies to your favorites by clicking the heart icon on any company listing. Your favorite companies will be saved in the Favourites page.',
        },
        {
            id: '5',
            question: 'How do I report an issue with my internship?',
            answer: 'You can report any issues by navigating to the Report Issue page. There, you can fill out a form with details about the issue and submit it for review.',
        },
        {
            id: '6',
            question: 'Is there a calendar for important dates?',
            answer: 'Yes, we have a Calendar feature that displays important dates and events related to your internship.',
        },
        {
            id: '7',
            question: 'Do students get paid for their internships?',
            answer: 'Yes, students are typically paid for their internships. The payment amount varies by company and position.',
        },
    ];

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div>
            {/* Hero Section */}
            <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
                    <HelpCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-sato font-extrabold text-gray-900">
                    Frequently Asked Questions
                </h1>
                <p className="text-base text-gray-500">
                    Everything you need to know about PBeyond
                </p>
            </div>

            {/* FAQ Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="bg-sidebar-background rounded-2xl border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                                        {faq.question}
                                    </h3>
                                    <button
                                        onClick={() => toggleExpand(faq.id)}
                                        className="flex-shrink-0 p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                                    >
                                        <ChevronRight
                                            className={`w-5 h-5 transform transition-transform duration-300 ${
                                                expandedId === faq.id ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                                <div
                                    className={`mt-3 text-gray-600 text-sm transition-all duration-300 overflow-hidden ${
                                        expandedId === faq.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

FAQs.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
