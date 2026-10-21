import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, Users } from 'lucide-react';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

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
    company: { company_id: number; company_name: string } | null;
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

export default function Dashboard({ company, stats, hasActiveEvaluationTemplate, students = [] }: Props) {
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
            <section className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Your company</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{company?.company_name ?? 'Company not assigned'}</h2>
                    <p className="mt-1 text-sm text-slate-500">Students are assigned directly to you by Company HR.</p>
                </div>
                <Link
                    href={route('industry-supervisor.students')}
                    className="ui-button ui-button-primary inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
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
                    <DashboardEmptyState message="Ask your Company HR to assign recruited students to your account." />
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
                                        <span className="ui-badge-warning ui-badge text-xs ">
                                            Evaluation due
                                        </span>
                                    )}
                                    {student.completion_confirmation_due && (
                                        <span className="ui-badge-info ui-badge text-xs ">
                                            Confirm completion
                                        </span>
                                    )}
                                    {!student.evaluation_due && !student.completion_confirmation_due && (
                                        <span className="ui-badge-neutral ui-badge text-xs ">
                                            No action pending
                                        </span>
                                    )}
                                    <Link
                                        href={route('industry-supervisor.student.show', student.student_id)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-primary transition hover:bg-blue-50 hover:text-primary"
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
