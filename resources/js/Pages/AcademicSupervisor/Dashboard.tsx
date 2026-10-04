import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { Activity, ArrowRight, CalendarDays, ClipboardCheck, Users } from 'lucide-react';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

interface Student {
    student_id: number;
    pb_student_code: string;
    full_name: string;
    programme?: { programme_name?: string };
}

interface Visit {
    visit_id: number;
    visit_date: string;
    notes?: string;
    class_name?: string;
}

interface Props {
    assignedClass: { class_id: number; programme_name?: string } | null;
    stats: {
        students: number;
        visits: number;
        pending_reviews: number;
        completed_reviews: number;
        monitoring_status: string;
    };
    students: Student[];
    recentVisits: Visit[];
}

const formatDate = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value;
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
};

export default function Dashboard({ assignedClass, stats, students = [], recentVisits = [] }: Props) {
    const safeStats = stats ?? {
        students: 0, visits: 0, pending_reviews: 0, completed_reviews: 0, monitoring_status: 'Not set',
    };

    return (
        <RoleDashboard
            title="Academic Supervisor"
            description="Keep track of your assigned class, student progress, and evaluation reviews."
            stats={[
                { label: 'Assigned students', value: safeStats.students, detail: assignedClass?.programme_name ?? 'No class assigned', icon: Users },
                { label: 'Visits recorded', value: safeStats.visits, detail: 'Academic supervision visits for your class', icon: CalendarDays },
                { label: 'Reviews pending', value: safeStats.pending_reviews, detail: `${safeStats.completed_reviews} evaluation reviews completed`, icon: ClipboardCheck },
                { label: 'Monitoring status', value: safeStats.monitoring_status, detail: 'Current status for your assigned class', icon: Activity },
            ]}
        >
            <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Assigned class</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                        {assignedClass?.programme_name ?? 'No class assigned'}
                    </h2>
                    {assignedClass && <p className="mt-1 text-sm text-slate-500">Class ID {assignedClass.class_id}</p>}
                </div>
                <Link
                    href={route('academic-supervisor.students')}
                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    View my students <ArrowRight className="size-4" />
                </Link>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <DashboardPanel
                    title="My students"
                    description="Students currently in your assigned class."
                    action={students.length > 0 ? (
                        <Link href={route('academic-supervisor.students')} className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                            View all
                        </Link>
                    ) : undefined}
                >
                    {students.length === 0 ? (
                        <DashboardEmptyState message={assignedClass ? 'No students are currently listed in your class.' : 'An administrator has not assigned a class to you yet.'} />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <div key={student.student_id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{student.full_name}</p>
                                        <p className="mt-1 text-sm text-slate-500">{student.pb_student_code}{student.programme?.programme_name ? ` · ${student.programme.programme_name}` : ''}</p>
                                    </div>
                                    <Link href={route('academic-supervisor.student.show', student.student_id)} aria-label={`View ${student.full_name}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700">
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel title="Recent visits" description="Latest visit records for your assigned class.">
                    {recentVisits.length === 0 ? (
                        <DashboardEmptyState message="No academic visits have been recorded yet." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentVisits.map((visit) => (
                                <div key={visit.visit_id} className="px-5 py-4 sm:px-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-slate-900">{visit.class_name ?? 'Class visit'}</p>
                                        <span className="shrink-0 text-xs font-medium text-slate-500">{formatDate(visit.visit_date)}</span>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{visit.notes || 'No visit notes.'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardPanel>
            </div>
        </RoleDashboard>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
