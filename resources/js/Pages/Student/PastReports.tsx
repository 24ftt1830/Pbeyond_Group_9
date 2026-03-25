import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { ReactNode } from 'react';

export default function PastReports() {
    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Past Reports</h1>
                <button
                    onClick={() => (window.location.href = route('student.report-issue'))}
                    className="rounded-md bg-black px-6 py-2 text-sm text-white"
                >
                    Add
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="px-4 py-3 text-left text-sm font-semibold">Report ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Company Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Issue Type</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Submission Date</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={6}>
                                No past reports available.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

PastReports.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
