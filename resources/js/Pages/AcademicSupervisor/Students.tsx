import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';

interface Student {
    student_id: number;
    pb_student_code: string;
    full_name: string;
    programme?: {
        programme_name?: string;
    };
}

interface AssignedClass {
    class_id: number;
    programme_name?: string;
}

interface Props {
    students: Student[];
    assignedClass: AssignedClass | null;
}

export default function Students({ students = [], assignedClass }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="My Students" />

            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-700">Academic Supervisor Portal</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                My Students
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Students in the class assigned to you.
                            </p>
                        </div>
                        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
                            <Users className="size-4 text-blue-700" />
                            {students.length} {students.length === 1 ? 'student' : 'students'}
                        </div>
                    </header>

                    <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-start gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">
                                <GraduationCap className="size-5" />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                                    Assigned class
                                </p>
                                <h2 className="mt-1 text-lg font-bold text-slate-900">
                                    {assignedClass?.programme_name ?? 'No class assigned'}
                                </h2>
                                {/* {assignedClass && (
                                    <p className="mt-1 text-sm text-slate-500">
                                        Class ID {assignedClass.class_id}
                                    </p>
                                )} */}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <GraduationCap className="size-4 text-blue-700" />
                            Students are listed from your assigned class.
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="font-semibold text-slate-900">Students in your class</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Select a student to view their details, visits, and progress.
                            </p>
                        </div>

                        {students.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                    <Users className="size-5" />
                                </span>
                                <p className="mt-4 font-semibold text-slate-900">
                                    {assignedClass ? 'No students in this class yet' : 'No class assigned'}
                                </p>
                                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                                    {assignedClass
                                        ? 'Students in your assigned class will appear here.'
                                        : 'Ask an administrator to assign a class to your account.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <div
                                        key={student.student_id}
                                        className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                                                {(student.full_name ?? 'S').charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-slate-900">
                                                    {student.full_name ?? 'Student'}
                                                </h3>
                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                    <span>{student.pb_student_code ?? 'Student ID not available'}</span>
                                                    {student.programme?.programme_name && (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <GraduationCap className="size-3.5" />
                                                            {student.programme.programme_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('academic-supervisor.student.show', student.student_id)}
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            View details
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
