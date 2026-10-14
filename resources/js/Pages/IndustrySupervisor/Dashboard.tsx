import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, Users } from 'lucide-react';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

interface Quota {
    quota_id: number;
    job_title: string;
    total_slots: number;
}

interface AssignedStudent {
    student_id: number;
    full_name: string;
    pb_student_code?: string;
    programme_name?: string;
    internship_start_date?: string | null;
    internship_end_date?: string | null;
    evaluation_due: boolean;
    completion_confirmation_due: boolean;
}

interface Props {
    quota: Quota | null;
    stats: {
        students_assigned: number;
        evaluations_due: number;
        completion_confirmations_due: number;
        students_with_dates: number;
    };
    hasActiveEvaluationTemplate: boolean;
    students: AssignedStudent[];
}

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export default function Dashboard({ quota, stats, hasActiveEvaluationTemplate, students = [] }: Props) {
    const safeStats = stats ?? {
        students_assigned: 0,
        evaluations_due: 0,
        completion_confirmations_due: 0,
        students_with_dates: 0,
    };

    return (
        <RoleDashboard
            title="Industry Supervisor"
            description="Manage evaluations and company completion confirmations for your assigned interns."
            stats={[
                { label: 'Students assigned', value: safeStats.students_assigned, detail: 'Students recruited by Company HR', icon: Users },
                { label: 'Evaluations to do', value: safeStats.evaluations_due, detail: hasActiveEvaluationTemplate ? 'Assigned students awaiting evaluation' : 'No active evaluation rubric is available', icon: ClipboardCheck },
                { label: 'Completion checks', value: safeStats.completion_confirmations_due, detail: 'Ended internships awaiting company confirmation', icon: CheckCircle2 },
                { label: 'Internship dates', value: safeStats.students_with_dates, detail: 'Assigned interns with confirmed dates', icon: CalendarDays },
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

            <DashboardPanel
                title="My interns"
                description="Review assigned students and see which actions are still pending."
            >
                {!hasActiveEvaluationTemplate && safeStats.evaluations_due > 0 && (
                    <p className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-800 sm:px-6">
                        Evaluation submissions are waiting for an active rubric from Admin.
                    </p>
                )}
                {students.length === 0 ? (
                    <DashboardEmptyState message={quota ? 'No students have been recruited for this position yet.' : 'Ask your Company HR to assign a job position to your account.'} />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {students.map((student) => (
                            <div key={student.student_id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">{student.full_name || 'Student'}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {student.pb_student_code ?? 'Student ID not available'}
                                        {student.programme_name ? ` · ${student.programme_name}` : ''}
                                        {student.internship_start_date && student.internship_end_date
                                            ? ` · ${formatDate(student.internship_start_date)} – ${formatDate(student.internship_end_date)}`
                                            : ' · Internship dates not set'}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    {student.evaluation_due && (
                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                                            Evaluation due
                                        </span>
                                    )}
                                    {student.completion_confirmation_due && (
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                            Confirm completion
                                        </span>
                                    )}
                                    {!student.evaluation_due && !student.completion_confirmation_due && (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                            No action pending
                                        </span>
                                    )}
                                    <Link
                                        href={route('industry-supervisor.student.show', student.student_id)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        View <ArrowRight className="size-4" />
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
