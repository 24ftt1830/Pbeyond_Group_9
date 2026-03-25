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
        'Result: Accepted/Rejected',
    ];

    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(applications[0]?.id ?? null);

    const selectedApplication = applications.find((application) => application.id === selectedApplicationId) ?? null;

    const formatDateTime = (value: string | null) => {
        if (!value) {
            return '-';
        }

        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
            return '-';
        }

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
        return {
            date: datePart?.trim() || '-',
            time: timeParts.join(',').trim() || '-',
        };
    };

    const processUpdates = processSteps
        .map((step, index) => ({
            status: step,
            dateTime: selectedStepTimes[index] ?? '-',
        }))
        .filter((update) => update.dateTime !== '-');

    return (
        <div className="w-full p-4 text-black">
            <h1 className="mb-4 text-2xl font-bold text-black">Application Tracking</h1>

            <div className="grid min-h-[620px] gap-6 lg:grid-cols-[1fr_320px]">
                <div className="rounded-xl border border-black/10 p-6">
                    <h2 className="text-center text-xl font-semibold">
                        {selectedApplication?.company?.name ?? 'No Company Selected'}
                    </h2>
                    <p className="mb-6 text-center text-sm text-black/70">
                        Applied on: {selectedAppliedDateTime}
                    </p>

                    <ol className="mx-auto flex w-full min-w-max items-start gap-0 overflow-x-auto pb-2">
                        {processSteps.map((step, index) => (
                            <li key={step} className="relative flex min-h-[130px] w-[170px] flex-col items-center px-1 text-center">
                                <div className="relative flex h-8 w-full items-center justify-center">
                                    <span
                                        className={`z-10 h-4 w-4 rounded-full border-2 ${
                                            selectedStepTimes[index] && selectedStepTimes[index] !== '-'
                                                ? 'border-emerald-700 bg-emerald-600'
                                                : 'border-black/50 bg-white'
                                        }`}
                                    />
                                    {index < processSteps.length - 1 && (
                                        <span
                                            className={`absolute top-1/2 left-1/2 h-[2px] w-[170px] -translate-y-1/2 ${
                                                selectedStepTimes[index + 1] && selectedStepTimes[index + 1] !== '-'
                                                    ? 'bg-emerald-600/70'
                                                    : 'bg-black/30'
                                            }`}
                                        />
                                    )}
                                </div>
                                <div className="mt-2 text-sm font-medium text-black">{step}</div>
                                <div
                                    className={`mt-1 text-xs ${
                                        selectedStepTimes[index] && selectedStepTimes[index] !== '-'
                                            ? 'font-medium text-emerald-700'
                                            : 'text-black/50'
                                    }`}
                                >
                                    {selectedStepTimes[index] ?? '-'}
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-6 rounded-lg border border-black/10 p-4">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-black">Updates</h3>
                        <div className="overflow-x-auto">
                            {processUpdates.length > 0 ? (
                                <table className="w-full min-w-[480px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-black/15 text-black/80">
                                            <th className="px-2 py-2 font-semibold">Date</th>
                                            <th className="px-2 py-2 font-semibold">Time</th>
                                            <th className="px-2 py-2 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processUpdates.map((update) => {
                                            const { date, time } = splitDateTime(update.dateTime);
                                            return (
                                                <tr key={`${update.status}-${update.dateTime}`} className="border-b border-black/10 bg-white/60 last:border-b-0">
                                                    <td className="px-2 py-2 text-black/80">{date}</td>
                                                    <td className="px-2 py-2 text-black/80">{time}</td>
                                                    <td className="px-2 py-2 font-medium text-black">{update.status}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="rounded-md border border-black/10 bg-white/60 p-2 text-sm text-black/70">
                                    No updates available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <aside className="rounded-xl border border-black/10 bg-[#D9D9D9] p-5">
                    <h2 className="mb-4 text-lg font-semibold text-black">Application Tracker</h2>

                    <div className="rounded-lg bg-white/80 p-4">
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">Applied Companies</h3>
                        <ul className="space-y-2 text-sm">
                            {applications.length > 0 ? (
                                applications.map((application) => (
                                    <li key={application.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedApplicationId(application.id)}
                                            className={`w-full rounded-md p-2 text-left ${
                                                selectedApplicationId === application.id
                                                    ? 'bg-black text-white'
                                                    : 'bg-white text-black'
                                            }`}
                                        >
                                            {application.company?.name ?? 'Unknown Company'}
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="rounded-md bg-white p-2 text-black/70">No applications yet.</li>
                            )}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}

ApplicationTracking.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
