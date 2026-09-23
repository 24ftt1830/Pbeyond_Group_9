import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Student {
    student_id: number;
    pb_student_code?: string;
    full_name?: string;
    programme?: {
        programme_name?: string;
    };
}

interface Props {
    students: Student[];
}

export default function Students({ students }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="My Students" />

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-6 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">
                            My Students
                        </h1>

                        <p className="mt-2 text-base text-slate-500">
                            Students assigned to you as an Industry Supervisor.
                        </p>
                    </div>

                    {/* Students List */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {students.length === 0 ? (
                            <div className="p-6">
                                <p className="text-sm text-slate-500">
                                    No students are currently assigned.
                                </p>
                            </div>
                        ) : (
                            students.map((student, index) => (
                                <div
                                    key={student.student_id}
                                    className={`flex items-center justify-between gap-6 px-6 py-7 ${
                                        index !== students.length - 1
                                            ? 'border-b border-slate-200'
                                            : ''
                                    }`}
                                >
                                    {/* Student Information */}
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            {student.full_name ?? 'Student'}
                                        </h2>

                                        <p className="mt-2 text-base text-slate-500">
                                            {student.pb_student_code ??
                                                'Student ID not available'}
                                        </p>

                                        <p className="mt-1 text-base text-slate-400">
                                            {student.programme?.programme_name ??
                                                'Programme not available'}
                                        </p>
                                    </div>

                                    {/* View Details */}
                                    <Link
                                        href={route(
                                            'industry-supervisor.student.show',
                                            student.student_id
                                        )}
                                        className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}