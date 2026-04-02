import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import type { ReactNode } from 'react';

type ApplicationItem = {
    id: number;
    status: string;
    applied_at: string | null;
    company: {
        id: number;
        name: string;
    } | null;
};

export default function ApplicationTracking({ applications = [] }: { applications?: ApplicationItem[] }) {
    const processSteps = [
        'Applied',
        'ILD Review',
        'Sent to Company',
        'Interview',
        'Under Review',
        'Result',
    ];

    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(applications[0]?.id ?? null);

    const selectedApplication = applications.find((application) => application.id === selectedApplicationId) ?? null;

    const formatDateTime = (value: string | null) => {
        if (!value) return '-';
        const parsedDate = new Date(value);
        if (isNaN(parsedDate.getTime())) return '-';
        return parsedDate.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const selectedAppliedDateTime = formatDateTime(selectedApplication?.applied_at ?? null);
    const selectedStepTimes = selectedApplication
        ? [selectedAppliedDateTime, '-', '-', '-', '-', '-']
        : ['-', '-', '-', '-', '-', '-'];

    const splitDateTime = (value: string) => {
        const [datePart, ...timeParts] = value.split(',');
        return { date: datePart?.trim() || '-', time: timeParts.join(',').trim() || '-' };
    };

    const processUpdates = processSteps
        .map((step, index) => ({
            status: step,
            dateTime: selectedStepTimes[index] ?? '-',
        }))
        .filter((update) => update.dateTime !== '-');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Application Tracking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content: timeline and updates */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            {selectedApplication?.company?.name ?? 'No Company Selected'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Applied on: {selectedAppliedDateTime}
                        </p>

                        {/* Timeline */}
                        <div className="mt-6">
                            <ol className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
                                {processSteps.map((step, index) => (
                                    <li key={step} className="relative flex flex-col items-center text-center min-w-[80px]">
                                        <div className="relative flex items-center justify-center">
                                            <span
                                                className={`z-10 h-3 w-3 rounded-full border ${
                                                    selectedStepTimes[index] !== '-'
                                                        ? 'bg-emerald-500 border-emerald-600'
                                                        : 'bg-gray-200 border-gray-300'
                                                }`}
                                            />
                                            {index < processSteps.length - 1 && (
                                                <span
                                                    className={`absolute top-1/2 left-1/2 w-full h-[2px] -translate-y-1/2 ${
                                                        selectedStepTimes[index + 1] !== '-'
                                                            ? 'bg-emerald-500'
                                                            : 'bg-gray-200'
                                                    }`}
                                                />
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs font-medium text-gray-700">{step}</div>
                                        <div
                                            className={`text-xs mt-1 ${
                                                selectedStepTimes[index] !== '-'
                                                    ? 'text-emerald-700'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            {selectedStepTimes[index] !== '-' ? selectedStepTimes[index] : '-'}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Updates table */}
                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Updates</h3>
                            <div className="overflow-x-auto">
                                {processUpdates.length > 0 ? (
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-left">
                                                <th className="pb-2 font-medium text-gray-500">Date</th>
                                                <th className="pb-2 font-medium text-gray-500">Time</th>
                                                <th className="pb-2 font-medium text-gray-500">Status</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                            {processUpdates.map((update) => {
                                                const { date, time } = splitDateTime(update.dateTime);
                                                return (
                                                    <tr key={`${update.status}-${update.dateTime}`} className="border-b border-gray-100 last:border-b-0">
                                                        <td className="py-2 text-gray-600">{date}</td>
                                                        <td className="py-2 text-gray-600">{time}</td>
                                                        <td className="py-2 font-medium text-gray-900">{update.status}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-gray-500 text-sm">No updates available yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: list of applied companies */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Applied Companies</h2>
                    {applications.length > 0 ? (
                        <ul className="space-y-2">
                            {applications.map((application) => (
                                <li key={application.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedApplicationId(application.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                            selectedApplicationId === application.id
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {application.company?.name ?? 'Unknown Company'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No applications yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

ApplicationTracking.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
