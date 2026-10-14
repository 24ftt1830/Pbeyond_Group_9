import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Users } from 'lucide-react';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

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
        pending_logbook_reviews: number;
        pending_reviews: number;
        final_decisions_ready: number;
        monitoring_status: string;
    };
    reviewQueue: ReviewItem[];
    recentVisits: Visit[];
}

interface ReviewItem {
    key: string;
    type: string;
    title: string;
    student_name: string;
    href: string;
}

const formatDate = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value;
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
};

export default function Dashboard({ assignedClass, stats, reviewQueue = [], recentVisits = [] }: Props) {
    const safeStats = stats ?? {
        students: 0, pending_logbook_reviews: 0, pending_reviews: 0, final_decisions_ready: 0, monitoring_status: 'Not set',
    };

    return (
        <RoleDashboard
            title="Academic Supervisor"
            description="Keep track of your assigned class, student progress, and evaluation reviews."
            stats={[
                { label: 'Assigned students', value: safeStats.students, detail: 'Students in your assigned class', icon: Users },
                { label: 'Logbooks to review', value: safeStats.pending_logbook_reviews, detail: 'Submitted weeks awaiting your review', icon: BookOpen },
                { label: 'Assessments to review', value: safeStats.pending_reviews, detail: 'Written reports and evaluations', icon: ClipboardCheck },
                { label: 'Final decisions ready', value: safeStats.final_decisions_ready, detail: 'Students ready for your completion decision', icon: CheckCircle2 },
            ]}
        >
            <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Assigned class</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                        {assignedClass?.programme_name ?? 'No class assigned'}
                    </h2>
                    {assignedClass && <p className="mt-1 text-sm text-slate-500">Class ID {assignedClass.class_id}</p>}
                    <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${safeStats.monitoring_status === 'At Risk' ? 'bg-rose-50 text-rose-700' : safeStats.monitoring_status === 'Needs Attention' ? 'bg-amber-50 text-amber-800' : safeStats.monitoring_status === 'On Track' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        Class status: {safeStats.monitoring_status}
                    </span>
                </div>
                <Link
                    href={route('academic-supervisor.students')}
                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    View class students <ArrowRight className="size-4" />
                </Link>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <DashboardPanel
                    title="Needs your attention"
                    description="Open logbooks, assessments, or final completion decisions that need your attention."
                >
                    {reviewQueue.length === 0 ? (
                        <DashboardEmptyState message="No logbooks, reports, or evaluations are waiting for review." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {reviewQueue.map((item) => (
                                <Link key={item.key} href={item.href} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-semibold text-slate-900">{item.student_name}</p>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{item.type}</span>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-slate-500">{item.title}</p>
                                    </div>
                                    <ArrowRight className="size-4 shrink-0 text-slate-400" />
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel title="Recent visits" description="Latest supervision visits recorded for your class.">
                    {recentVisits.length === 0 ? (
                        <DashboardEmptyState message="No academic visits have been recorded yet." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentVisits.slice(0, 3).map((visit) => (
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
