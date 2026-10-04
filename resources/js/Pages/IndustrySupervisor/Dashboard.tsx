import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, ClipboardCheck, Users } from 'lucide-react';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

interface Quota {
    quota_id: number;
    job_title: string;
    total_slots: number;
}

interface Applicant {
    id: number;
    student_id: number;
    app_status: string;
    updated_at: string;
    student?: {
        full_name?: string;
        pb_student_code?: string;
        programme?: { programme_name?: string };
    };
}

interface Props {
    quota: Quota | null;
    stats: {
        applicants: number;
        pending_applications: number;
        evaluations: number;
        evaluations_due: number;
    };
    recentRecruits: Applicant[];
}

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const statusClass = (status: string) => {
    if (status === 'Recruited') return 'bg-emerald-50 text-emerald-700';
    if (status === 'Declined') return 'bg-rose-50 text-rose-700';
    if (status === 'Interviewing') return 'bg-violet-50 text-violet-700';
    return 'bg-amber-50 text-amber-700';
};

export default function Dashboard({ quota, stats, recentRecruits = [] }: Props) {
    const safeStats = stats ?? { students_assigned: 0, position_slots: 0, evaluations: 0, evaluations_due: 0 };

    return (
        <RoleDashboard
            title="Industry Supervisor"
            description="See students recruited for your assigned position and keep up with their evaluations."
            stats={[
                { label: 'Students assigned', value: safeStats.students_assigned, detail: 'Students recruited by Company HR', icon: Users },
                { label: 'Position slots', value: safeStats.position_slots, detail: quota?.job_title ?? 'No job position assigned', icon: Briefcase },
                { label: 'Evaluations submitted', value: safeStats.evaluations, detail: 'Evaluations you have completed', icon: ClipboardCheck },
                { label: 'Evaluations to do', value: safeStats.evaluations_due, detail: 'Recruited students without an evaluation', icon: ClipboardCheck },
            ]}
        >
            <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Assigned job position</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">{quota?.job_title ?? 'No position assigned'}</h2>
                    {quota && <p className="mt-1 text-sm text-slate-500">{quota.total_slots} total {quota.total_slots === 1 ? 'slot' : 'slots'}</p>}
                </div>
                <Link
                    href={route('industry-supervisor.students')}
                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    View my students <ArrowRight className="size-4" />
                </Link>
            </section>

            <DashboardPanel title="Recently recruited students" description="Students appear here after Company HR marks their application Recruited.">
                {recentRecruits.length === 0 ? (
                    <DashboardEmptyState message={quota ? 'No students have been recruited for this position yet.' : 'Ask your Company HR to assign a job position to your account.'} />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentRecruits.map((application) => (
                            <div key={application.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">{application.student?.full_name ?? 'Student'}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {application.student?.pb_student_code ?? 'Student ID not available'}
                                        {application.student?.programme?.programme_name ? ` · ${application.student.programme.programme_name}` : ''}
                                        {` · Recruited ${formatDate(application.updated_at)}`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(application.app_status)}`}>
                                        Assigned
                                    </span>
                                    <Link
                                        href={route('industry-supervisor.student.show', application.student_id)}
                                        aria-label={`View ${application.student?.full_name ?? 'student'}`}
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                                    >
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardPanel>
        </RoleDashboard>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
