import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, Building2, CheckCircle2, Clock3, FileText, Users } from 'lucide-react';
import { ScrollAreaHorizontalDemo } from '@/Components/Dashboard/company-onboarding';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

interface Quota {
    quota_id: number;
    job_title: string;
    total_slots: number;
    quota_status: string;
    is_released: boolean;
    application_count: number;
}

interface Application {
    id: number;
    created_at: string;
    app_status: string;
    student?: { full_name?: string; pb_student_code?: string };
    quota?: { job_title?: string };
}

interface Stats {
    total_applications: number;
    new_applications: number;
    pending_reviews: number;
    total_quotas: number;
    open_quotas: number;
    recruitment_status: { recruited: number; total: number };
}

interface Props {
    quotas: Quota[];
    applications: Application[];
    stats: Stats;
    completedOnboardingTasks?: string[];
}

const statusClass = (status: string) => {
    if (status === 'Recruited') return 'bg-emerald-50 text-emerald-700';
    if (status === 'Declined') return 'bg-rose-50 text-rose-700';
    if (status === 'Interviewing') return 'bg-violet-50 text-violet-700';
    return 'bg-amber-50 text-amber-700';
};

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export default function Dashboard({
    quotas = [],
    applications = [],
    stats,
    completedOnboardingTasks = [],
}: Props) {
    const safeStats = stats ?? {
        total_applications: 0,
        new_applications: 0,
        pending_reviews: 0,
        total_quotas: 0,
        open_quotas: 0,
        recruitment_status: { recruited: 0, total: 0 },
    };

    return (
        <RoleDashboard
            title="Company HR"
            description="Monitor job positions, review student applications, and track recruitment."
            stats={[
                { label: 'Job positions', value: safeStats.total_quotas, detail: `${safeStats.open_quotas} approved and released`, icon: Building2 },
                { label: 'Applications', value: safeStats.total_applications, detail: `${safeStats.new_applications} received in the past 7 days`, icon: FileText },
                { label: 'Pending reviews', value: safeStats.pending_reviews, detail: 'Applications awaiting your review', icon: Clock3 },
                { label: 'Students recruited', value: `${safeStats.recruitment_status.recruited} / ${safeStats.recruitment_status.total}`, detail: 'Recruited students compared with total slots', icon: CheckCircle2 },
            ]}
        >
            {completedOnboardingTasks.length < 3 && (
                <DashboardPanel title="Company setup" description="Complete these steps to prepare your company for student applications.">
                    <div className="p-4 sm:p-5">
                        <ScrollAreaHorizontalDemo completedOnboardingTasks={completedOnboardingTasks} />
                    </div>
                </DashboardPanel>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
                <DashboardPanel
                    title="Recent applications"
                    description="The latest students who applied to your positions."
                    action={<Link href={route('company.applications')} className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all</Link>}
                >
                    {applications.length === 0 ? (
                        <DashboardEmptyState message="No applications have been received yet." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {applications.map((application) => (
                                <div key={application.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{application.student?.full_name ?? 'Student'}</p>
                                        <p className="mt-1 truncate text-sm text-slate-500">
                                            {application.quota?.job_title ?? 'Position'} · {application.student?.pb_student_code ?? 'Student ID unavailable'} · {formatDate(application.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${statusClass(application.app_status)}`}>{application.app_status}</span>
                                        <Link href={route('company.applications.view', application.id)} aria-label={`Review ${application.student?.full_name ?? 'application'}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700">
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel
                    title="Your job positions"
                    description="Check approval and release status for your quotas."
                    action={<Link href={route('company.quotas')} className="text-sm font-semibold text-blue-700 hover:text-blue-800">Manage positions</Link>}
                >
                    {quotas.length === 0 ? (
                        <DashboardEmptyState message="You have not created any job positions yet." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {quotas.slice(0, 5).map((quota) => (
                                <div key={quota.quota_id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{quota.job_title}</p>
                                        <p className="mt-1 text-sm text-slate-500">{quota.application_count} {quota.application_count === 1 ? 'application' : 'applications'} · {quota.total_slots} {quota.total_slots === 1 ? 'slot' : 'slots'}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${quota.quota_status === 'Approved' && quota.is_released ? 'bg-emerald-50 text-emerald-700' : quota.quota_status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {quota.is_released && quota.quota_status === 'Approved' ? 'Live' : quota.quota_status}
                                    </span>
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
