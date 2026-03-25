import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import type { ReactNode } from 'react';

export default function FAQs() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const faqs = [
        {
            id: '1',
            question: 'What is PBeyond?',
            answer: 'PBeyond is a platform designed to help students find and apply for internships, track their applications, and manage their internship experience. It provides features such as a companies list, application tracking, a calendar for important dates, and a favorites section to save preferred companies.',
        },
        {
            id: '2',
            question: 'What is the application deadline?',
            answer: 'Application deadlines vary by company. Please check each company\'s listing for their specific deadline dates. You can also contact the company directly for more information.',
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
            answer: 'You can report any issues you encounter during your internship by navigating to the Report Issue page. There, you can fill out a form with details about the issue and submit it for review.',
        },
        {
            id: '6',
            question: 'Is there a calendar for important dates?',
            answer: 'Yes, we have a Calendar feature that displays important dates and events related to your internship. You can navigate through months and view key information there.',
        },
        {
            id: '7',
            question: 'Do students get paid for their internships?',
            answer: 'Yes, students are typically paid for their internships. The payment amount varies by company and position. You can check each company\'s listing for more details.',
        },
    ];

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">FAQs</h1>
            <div className="max-w-3xl space-y-3">
                {faqs.map((faq) => (
                    <div
                        key={faq.id}
                        className="border border-muted rounded-lg overflow-hidden shadow-md"
                    >
                        <button
                            onClick={() => toggleExpand(faq.id)}
                            className="w-full px-4 py-4 text-left font-medium hover:bg-muted/50 transition-colors flex items-center justify-between"
                        >
                            <span>{faq.question}</span>
                            <span className="text-lg">
                                {expandedId === faq.id ? '−' : '+'}
                            </span>
                        </button>
                        {expandedId === faq.id && (
                            <div className="px-4 py-3 bg-muted/30 text-sm border-t border-muted">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

FAQs.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
