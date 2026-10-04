import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, CheckCircle2, FileText, Search } from 'lucide-react';
import { ScrollAreaHorizontalDemo, steps } from '@/Components/Dashboard/student-onboarding';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

interface Quota {
    quota_id: number;
    position_title: string;
    total_slots: number;
    filled: number;
    available: number;
    is_full: boolean;
    company: {
        company_id: number;
        company_name: string;
        office_address: string;
    };
}

interface Application {
    id: number;
    app_status: string;
    created_at: string;
    job_title?: string;
    company_name?: string;
}

interface Props {
    availableQuotas: Quota[];
    studentProgramme: string;
    completedOnboardingTasks?: string[];
    recentApplications: Application[];
    stats: {
        open_positions: number;
        available_slots: number;
        applications: number;
        pending_applications: number;
        recruited_applications: number;
    };
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
    availableQuotas = [],
    studentProgramme,
    completedOnboardingTasks = [],
    recentApplications = [],
    stats,
}: Props) {
    const safeStats = stats ?? {
        open_positions: 0, available_slots: 0, applications: 0, pending_applications: 0, recruited_applications: 0,
    };

    return (
        <RoleDashboard
            title="Student"
            description={`Your internship opportunities and application progress${studentProgramme ? ` for ${studentProgramme}` : ''}.`}
            stats={[
                { label: 'Open positions', value: safeStats.open_positions, detail: 'Positions matching your programme', icon: Briefcase },
                { label: 'Available slots', value: safeStats.available_slots, detail: 'Places remaining across matching positions', icon: Search },
                { label: 'My applications', value: safeStats.applications, detail: `${safeStats.pending_applications} awaiting a response`, icon: FileText },
                { label: 'Recruited', value: safeStats.recruited_applications, detail: 'Positions where you have been recruited', icon: CheckCircle2 },
            ]}
        >
            {completedOnboardingTasks.length < steps.length && (
                <DashboardPanel
                    title="Get ready to apply"
                    description={`${completedOnboardingTasks.length} of ${steps.length} preparation steps completed.`}
                >
                    <div className="p-4 sm:p-5">
                        <ScrollAreaHorizontalDemo completedOnboardingTasks={completedOnboardingTasks} />
                    </div>
                </DashboardPanel>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
                <DashboardPanel
                    title="Positions for your programme"
                    description="Approved openings that match your programme."
                    action={<Link href={route('student.companies')} className="text-sm font-semibold text-blue-700 hover:text-blue-800">Browse all</Link>}
                >
                    {availableQuotas.length === 0 ? (
                        <DashboardEmptyState message="There are no released positions matching your programme right now." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {availableQuotas.slice(0, 5).map((quota) => (
                                <div key={quota.quota_id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{quota.position_title}</p>
                                        <p className="mt-1 truncate text-sm text-slate-500">{quota.company.company_name} · {quota.company.office_address}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${quota.is_full ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                            {quota.is_full ? 'Full' : `${quota.available} slots`}
                                        </span>
                                        <Link href={route('student.companies.view', quota.company.company_id)} aria-label={`View ${quota.position_title}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700">
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardPanel>

                <DashboardPanel
                    title="Recent applications"
                    description="Check the latest status of positions you applied for."
                    action={<Link href={route('student.application-tracking')} className="text-sm font-semibold text-blue-700 hover:text-blue-800">Track all</Link>}
                >
                    {recentApplications.length === 0 ? (
                        <DashboardEmptyState message="You have not applied to any positions yet." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentApplications.map((application) => (
                                <div key={application.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{application.job_title ?? 'Position'}</p>
                                        <p className="mt-1 text-sm text-slate-500">{application.company_name ?? 'Company'} · Applied {formatDate(application.created_at)}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(application.app_status)}`}>
                                        {application.app_status}
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
