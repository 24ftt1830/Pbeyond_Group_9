import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';

type Student = {
    student_id: number;
    student_code: string | null;
    full_name: string;
    programme: string | null;
    company_name: string | null;
    start_date: string | null;
    end_date: string | null;
    monitoring_status: 'Needs Attention' | 'At Risk';
};

type Props = {
    students: Student[];
    selectedSemester: number | null;
    selectedSemesterName: string | null;
};

function formatDate(value: string | null) {
    if (!value) return '—';

    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(year, month - 1, day));
}

export default function Interventions({ students, selectedSemester, selectedSemesterName }: Props) {
    const dashboardUrl = selectedSemester
        ? route('admin.dashboard', { semester: selectedSemester })
        : route('admin.dashboard');

    return (
        <AuthenticatedLayout>
            <Head title="Students Requiring Intervention" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <div className="mb-6">
                        <BackButton href={dashboardUrl} className="mb-3">Back to Dashboard</BackButton>

                        <h1 className="text-2xl font-semibold text-slate-900">
                            Students Requiring Intervention
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Internship students marked as needing attention or at risk by an PB Supervisor.
                            {selectedSemesterName ? ` Filtered to ${selectedSemesterName}.` : ''}
                        </p>
                    </div>

                    {/* Student List */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                        {/* Card Header */}
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Internship Students in Flagged Classes
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {students.length} student
                                {students.length !== 1 ? 's' : ''} in a class marked for intervention.
                            </p>
                        </div>

                        {/* Empty State */}
                        {students.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="text-sm text-slate-500">
                                    No students in this semester are in classes flagged for intervention.
                                </p>
                            </div>
                        ) : (
                            /* Student Table */
                            <div className="overflow-x-auto">
                                <table className="ui-table min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Student
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Programme
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Company / Internship
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
                                                        {student.student_code ?? 'No student ID'}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {student.programme ?? '—'}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    <div>{student.company_name ?? 'Company not linked'}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {formatDate(student.start_date)} – {formatDate(student.end_date)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {student.monitoring_status ===
                                                    'At Risk' ? (
                                                        <span className="ui-badge-danger ui-badge inline-flex text-xs ">
                                                            At Risk
                                                        </span>
                                                    ) : (
                                                        <span className="ui-badge-warning ui-badge inline-flex text-xs ">
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
