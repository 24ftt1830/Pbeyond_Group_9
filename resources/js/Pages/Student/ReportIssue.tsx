import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

export default function ReportIssue() {
    const [formData, setFormData] = useState({
        company: '',
        description: '',
        issueType: '',
        otherIssueType: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const issueTypes = [
        'Harassment/Discrimination',
        'Poor working condition',
        'Underpaid',
        'Excessive workload',
        'Irrelevant tasks',
        'Others',
    ];

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, company: e.target.value });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, description: e.target.value });
    };

    const handleIssueTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, issueType: e.target.value });
    };

    const handleOtherIssueTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, otherIssueType: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('student.report-issue.store'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setFormData({ company: '', description: '', issueType: '', otherIssueType: '' });
                // Optional: show a success message or redirect
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Report Issue</h1>
                <button
                    onClick={() => (window.location.href = route('student.past-reports'))}
                    className="rounded-md border border-black px-6 py-2 text-sm text-black"
                >
                    View Past Reports
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="company" className="block text-sm font-medium">
                        Company Name
                    </label>
                    <input
                        id="company"
                        type="text"
                        placeholder="Select or type company name"
                        value={formData.company}
                        onChange={handleCompanyChange}
                        className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium">
                        Describe the issue
                    </label>
                    <textarea
                        id="description"
                        placeholder="Describe the issue"
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        className="mt-2 h-[150px] w-full rounded-md border px-3 py-2 text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Issue Type</label>
                    <div className="mt-3 space-y-2">
                        {issueTypes.map((type) => (
                            <div key={type} className="flex items-center">
                                <input
                                    type="radio"
                                    id={type}
                                    name="issueType"
                                    value={type}
                                    checked={formData.issueType === type}
                                    onChange={handleIssueTypeChange}
                                    className="h-4 w-4"
                                    required
                                />
                                <label htmlFor={type} className="ml-2 text-sm">
                                    {type}
                                </label>
                            </div>
                        ))}
                    </div>
                    {formData.issueType === 'Others' && (
                        <input
                            type="text"
                            placeholder="Specify other issue type"
                            value={formData.otherIssueType}
                            onChange={handleOtherIssueTypeChange}
                            className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
                        />
                    )}
                </div>

                <div className="mt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-md bg-black px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}

ReportIssue.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
