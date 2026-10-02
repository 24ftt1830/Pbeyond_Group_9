import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

type Student = {
    student_id: number;
    student_code: string;
    full_name: string;
    programme: string | null;
    monitoring_status: 'Needs Attention' | 'At Risk';
};

type Props = {
    students: Student[];
};

export default function Interventions({ students }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Students Requiring Intervention" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.dashboard')}
                            className="mb-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            ← Back to Dashboard
                        </Link>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Students Requiring Intervention
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Students currently marked as needing attention or at risk.
                        </p>
                    </div>

                    {/* Student List */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                        {/* Card Header */}
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Flagged Students
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {students.length} student
                                {students.length !== 1 ? 's' : ''} currently require
                                intervention.
                            </p>
                        </div>

                        {/* Empty State */}
                        {students.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="text-sm text-slate-500">
                                    No students currently require intervention.
                                </p>
                            </div>
                        ) : (
                            /* Student Table */
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Student
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Programme
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Monitoring Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {students.map((student) => (
                                            <tr key={student.student_id}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="font-medium text-slate-900">
                                                        {student.full_name}
                                                    </div>

                                                    <div className="text-sm text-slate-500">
                                                        {student.student_code}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {student.programme ?? '—'}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {student.monitoring_status ===
                                                    'At Risk' ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                            At Risk
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                            Needs Attention
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}