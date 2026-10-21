import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen, CheckCircle2, Clock3, ChevronRight, Search, Users } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { inputClass, linkClass } from '@/Components/Admin/RecordControls';
import { Badge } from '@/Components/ui/badge';

interface StudentLogbooks {
    student_id: number;
    full_name?: string;
    pb_student_code?: string;
    pending_count: number;
    approved_count: number;
    missing_count: number;
    total_submissions: number;
}

interface Props {
    students?: StudentLogbooks[];
    stats?: { pending: number; approved: number; total: number };
    canReview?: boolean;
    viewer?: 'industry' | 'academic';
}

export default function Logbook({ students = [], stats = { pending: 0, approved: 0, total: 0 }, canReview = false, viewer = 'academic' }: Props) {
    const [search, setSearch] = useState('');
    const query = search.trim().toLowerCase();
    const visibleStudents = [...students]
        .sort((first, second) => (first.full_name ?? '').localeCompare(second.full_name ?? '', undefined, { sensitivity: 'base' }) || first.student_id - second.student_id)
        .filter(student => `${student.full_name ?? ''} ${student.pb_student_code ?? ''}`.toLowerCase().includes(query));
    const studentRoute = viewer === 'industry' ? 'industry-supervisor.logbook.student' : 'academic-supervisor.logbook.student';
    const reviewLabel = canReview ? 'Awaiting review' : 'Awaiting Industry review';
    const summary = [
        { label: reviewLabel, value: stats.pending, icon: Clock3 },
        { label: 'Approved weeks', value: stats.approved, icon: CheckCircle2 },
        { label: 'Total submissions', value: stats.total, icon: BookOpen },
    ];

    return <AuthenticatedLayout>
        <Head title={canReview ? 'Weekly Logbook Review' : 'Student Logbooks'} />
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <header>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{canReview ? 'Weekly Logbook Review' : 'Student Logbooks'}</h1>
                    {!canReview && <Badge variant="secondary">View only</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-500">{canReview ? 'Choose a student to review their weekly logbooks.' : 'Choose a student to view their weekly entries and Industry Supervisor feedback.'}</p>
            </header>

            <section aria-label="Logbook summary" className="grid gap-4 sm:grid-cols-3">
                {summary.map(({ label, value, icon: Icon }) => <div key={label} className="ui-card flex items-start justify-between p-5">
                    <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div>
                    <span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={19} aria-hidden="true" /></span>
                </div>)}
            </section>

            <section className="space-y-4" aria-labelledby="assigned-students-title">
                <div>
                    <h2 id="assigned-students-title" className="text-base font-semibold text-slate-900">Assigned students <span className="ml-1 text-sm font-normal text-slate-500">({students.length})</span></h2>
                    <p className="mt-1 text-sm text-slate-500">Open a student’s logbooks to see their weeks in order.</p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                    <Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search student or student ID…" aria-label="Search students" className={inputClass + ' pl-9'} />
                </div>

                <div className="ui-card overflow-hidden">
                    <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-center gap-5 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-medium text-slate-500 md:grid">
                        <span>Student</span>
                        <div className="grid grid-cols-3 gap-4"><span>{reviewLabel}</span><span>Approved weeks</span><span>Submitted weeks</span></div>
                        <span className="min-w-[139px] text-right">Action</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {visibleStudents.map(student => <div key={student.student_id} className="grid gap-4 p-5 transition-colors hover:bg-slate-50/50 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] md:items-center md:gap-5">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{student.full_name || 'Student'}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-xs text-slate-500">{student.pb_student_code}</span>
                                    {student.missing_count > 0 && <Badge variant="destructive">{student.missing_count} missing {student.missing_count === 1 ? 'week' : 'weeks'}</Badge>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="mb-1 text-xs text-slate-500 md:hidden">{reviewLabel}</p>
                                    {student.pending_count > 0 ? <Badge variant="warning">{student.pending_count} {student.pending_count === 1 ? 'week' : 'weeks'}</Badge> : <span className="text-slate-500">0</span>}
                                </div>
                                <div><p className="mb-1 text-xs text-slate-500 md:hidden">Approved weeks</p><span className="text-slate-700">{student.approved_count}</span></div>
                                <div><p className="mb-1 text-xs text-slate-500 md:hidden">Submitted weeks</p><span className="text-slate-700">{student.total_submissions}</span></div>
                            </div>

                            <Link href={route(studentRoute, { student: student.student_id })} className={linkClass + ' w-fit'} aria-label={`View logbooks for ${student.full_name || student.pb_student_code || 'student'}`}>
                                View logbooks<ChevronRight size={14} aria-hidden="true" />
                            </Link>
                        </div>)}
                    </div>

                    {!visibleStudents.length && <div className="px-6 py-8 text-center">
                        <Users size={25} className="mx-auto mb-3 text-slate-300" aria-hidden="true" />
                        <p className="text-sm font-medium text-slate-700">{students.length ? 'No matching students' : 'No assigned students'}</p>
                        <p className="mt-1 text-xs text-slate-500">{students.length ? 'Try another name or student ID.' : 'Your assigned students will appear here, even before they submit their first logbook.'}</p>
                    </div>}
                </div>
            </section>
        </main>
    </AuthenticatedLayout>;
}
