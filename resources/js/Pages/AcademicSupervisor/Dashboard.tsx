import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Users } from 'lucide-react';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

interface Visit {
    visit_id: number;
    visit_date: string;
    notes?: string;
    student_name?: string;
}

interface Props {
    stats: {
        students: number;
        logbook_submissions: number;
        pending_reviews: number;
        final_decisions_ready: number;
        needs_attention: number;
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

export default function Dashboard({ stats, reviewQueue = [], recentVisits = [] }: Props) {
    const safeStats = stats ?? {
        students: 0, logbook_submissions: 0, pending_reviews: 0, final_decisions_ready: 0, needs_attention: 0,
    };

    return (
        <RoleDashboard
            title="PB Supervisor"
            description="Keep track of your students, progress and assessments."
            stats={[
                { label: 'Assigned students', value: safeStats.students, detail: 'Students under your supervision', icon: Users },
                { label: 'Logbook submissions', value: safeStats.logbook_submissions, detail: 'View logs reviewed by Industry Supervisors', icon: BookOpen },
                { label: 'Assessments to review', value: safeStats.pending_reviews, detail: 'Written reports and evaluations', icon: ClipboardCheck },
                { label: 'Final decisions ready', value: safeStats.final_decisions_ready, detail: 'Students ready for your completion decision', icon: CheckCircle2 },
            ]}
        >
            <section className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Student supervision</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        {safeStats.students} {safeStats.students === 1 ? 'student' : 'students'} assigned to you
                    </h2>
                    <span className={'ui-badge ' + (`mt-3 inline-flex text-xs ${safeStats.needs_attention ? 'ui-badge-warning ' : 'ui-badge-success '}`)}>
                        {safeStats.needs_attention} need attention
                    </span>
                </div>
                <Link
                    href={route('academic-supervisor.students')}
                    className="ui-button ui-button-primary inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                    Manage students <ArrowRight className="size-4" />
                </Link>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <DashboardPanel
                    title="Needs your attention"
                    description="Reports, assessments and final decisions that need your attention."
                >
                    {reviewQueue.length === 0 ? (
                        <DashboardEmptyState message="No reports, assessments or final decisions need your attention." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {reviewQueue.map((item) => (
                                <Link key={item.key} href={item.href} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-semibold text-slate-900">{item.student_name}</p>
                                            <span className="ui-badge-neutral ui-badge text-xs font-medium">{item.type}</span>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-slate-500">{item.title}</p>
                                    </div>
                                    <ArrowRight className="size-4 shrink-0 text-slate-400" />
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel title="Recent visits" description="Latest supervision visits recorded for your students.">
                    {recentVisits.length === 0 ? (
                        <DashboardEmptyState message="No supervision visits have been recorded yet." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentVisits.slice(0, 3).map((visit) => (
                                <div key={visit.visit_id} className="px-5 py-4 sm:px-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-slate-900">{visit.student_name ?? 'Student visit'}</p>
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
