import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Programme {
    programme_id: number;
    programme_name?: string;
}

interface Student {
    student_id: number;
    pb_student_code: string;
    full_name: string;
    programme?: Programme;
}

interface Props {
    students: Student[];
}

export default function Students({ students }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="My Students" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">
                            My Students
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Students assigned to you as an Academic Supervisor.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        {students.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm font-semibold text-slate-900">
                                    No students assigned
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    There are currently no students assigned
                                    to you.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <div
                                        key={student.student_id}
                                        className="flex items-center justify-between p-5"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {student.full_name}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {student.pb_student_code}
                                            </p>

                                            {student.programme?.programme_name && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {student.programme.programme_name}
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            href={route(
                                                'academic-supervisor.student.show',
                                                student.student_id
                                            )}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}