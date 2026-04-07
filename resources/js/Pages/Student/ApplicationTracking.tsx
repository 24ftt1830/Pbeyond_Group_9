import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';

type ApplicationItem = {
    id: number;
    status: string;
    status_label: string;
    step: number;
    applied_at: string | null;
    company: {
        id: number;
        name: string;
    } | null;
};

export default function ApplicationTracking({ applications = [] }: { applications?: ApplicationItem[] }) {
    const processSteps = [
        { key: 'applied', label: 'Application Submitted' },
        { key: 'ild_review', label: 'ILD Review' },
        { key: 'company_review', label: 'Company Review' },
        { key: 'interview', label: 'Interview (if required)' },
        { key: 'result', label: 'Final Result' },
    ];

    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(applications[0]?.id ?? null);
    const selectedApp = applications.find((app) => app.id === selectedApplicationId) ?? null;
    const currentStep = selectedApp?.step ?? -1;

    const formatDate = (value: string | null) => {
        if (!value) return '-';
        const d = new Date(value);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Application Tracking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content: vertical timeline */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-medium text-gray-900">
                                    {selectedApp?.company?.name ?? 'No Company Selected'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Applied on {formatDate(selectedApp?.applied_at)}
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                {selectedApp?.status_label ?? 'No status'}
                            </div>
                        </div>

                        {/* Vertical timeline */}
                        <div className="mt-6 space-y-6">
                            {processSteps.map((step, idx) => {
                                let statusIcon;
                                let statusClass = '';
                                if (idx < currentStep) {
                                    statusIcon = <CheckCircle className="w-5 h-5 text-green-500" />;
                                    statusClass = 'text-gray-900';
                                } else if (idx === currentStep) {
                                    statusIcon = <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
                                    statusClass = 'text-blue-600 font-medium';
                                } else {
                                    statusIcon = <Circle className="w-5 h-5 text-gray-300" />;
                                    statusClass = 'text-gray-400';
                                }

                                return (
                                    <div key={step.key} className="relative flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="z-10 bg-white rounded-full p-0.5">
                                                {statusIcon}
                                            </div>
                                            {idx < processSteps.length - 1 && (
                                                <div className="w-px h-12 bg-gray-200 my-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className={`text-sm ${statusClass}`}>
                                                {step.label}
                                            </div>
                                            {idx === currentStep && (
                                                <p className="text-xs text-blue-600 mt-1">Current step</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar: list of applied companies */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Your Applications</h2>
                    {applications.length > 0 ? (
                        <ul className="space-y-2">
                            {applications.map((app) => (
                                <li key={app.id}>
                                    <button
                                        onClick={() => setSelectedApplicationId(app.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                            selectedApplicationId === app.id
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {app.company?.name ?? 'Unknown Company'}
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
