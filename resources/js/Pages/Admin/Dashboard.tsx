import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Users,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { DashboardEmptyState, DashboardPanel, RoleDashboard } from '@/Components/Dashboard/RoleDashboard';

type DashboardStats = {
    pending_companies: number;
    pending_quotas: number;
    total_students: number;
    unplaced_students: number;
    accepted_students: number;
    available_quotas: number;
    placement_rate: number;
    weekly_logbooks_awaiting_review: number;
    weekly_logbooks_approved: number;
    weekly_logbooks_needing_fixes: number;
    missing_logbooks: number;
    missing_logbook_weeks: number;
    approaching_completion: number;
    requiring_intervention: number;
};

type ProgressStudent = {
    student_id: number;
    student_code: string | null;
    full_name: string;
    programme_name: string | null;
    company_name: string | null;
    start_date: string | null;
    end_date: string | null;
    missing_weeks?: number;
    oldest_missing_week?: string | null;
    monitoring_status?: 'Needs Attention' | 'At Risk';
};

type DashboardProgress = {
    current_internships: ProgressStudent[];
    missing_logbooks: ProgressStudent[];
    approaching_completion: ProgressStudent[];
    requiring_intervention: ProgressStudent[];
};

type Activity = {
    id: number;
    initials: string;
    student_name: string;
    company_name: string;
    status: string;
    date?: string | null;
};

type PageProps = {
    stats: DashboardStats;
    availableSemesters: { id: number; name: string; starts_on: string; ends_on: string }[];
    selectedSemester: number | null;
    selectedSemesterName: string | null;
    activities: Activity[];
    progress: DashboardProgress;
};

const emptyStats: DashboardStats = {
    pending_companies: 0,
    pending_quotas: 0,
    total_students: 0,
    unplaced_students: 0,
    accepted_students: 0,
    available_quotas: 0,
    placement_rate: 0,
    weekly_logbooks_awaiting_review: 0,
    weekly_logbooks_approved: 0,
    weekly_logbooks_needing_fixes: 0,
    missing_logbooks: 0,
    missing_logbook_weeks: 0,
    approaching_completion: 0,
    requiring_intervention: 0,
};

const emptyProgress: DashboardProgress = {
    current_internships: [],
    missing_logbooks: [],
    approaching_completion: [],
    requiring_intervention: [],
};

export default function AdminDashboard() {
    const props = usePage().props as unknown as PageProps;
    const stats = props.stats ?? emptyStats;
    const availableSemesters = props.availableSemesters ?? [];
    const selectedSemester = props.selectedSemester ?? null;
    const selectedSemesterName = props.selectedSemesterName ?? 'Selected semester';
    const activities = props.activities ?? [];
    const progress = props.progress ?? emptyProgress;

    const chartData = [
        { name: 'Accepted', value: stats.accepted_students, color: '#2563eb' },
        { name: 'Unplaced', value: stats.unplaced_students, color: '#94a3b8' },
    ];

    const handleSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        router.get(route('admin.dashboard'), value ? { semester: value } : {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <RoleDashboard
            title="Superadmin"
            description="Manage approvals, track placements, and monitor internship progress."
            headerAction={(
                <div className="flex items-center gap-3">
                    <label htmlFor="semester" className="text-sm font-medium text-slate-600">Semester</label>
                    <select
                        id="semester"
                        value={selectedSemester ?? ''}
                        onChange={handleSemesterChange}
                        className="h-10 min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    >
                        {availableSemesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>{semester.name}</option>
                        ))}
                    </select>
                </div>
            )}
            stats={[
                { label: 'Pending companies', value: stats.pending_companies, detail: 'Awaiting admin review', icon: Building2, href: '/admin/companies' },
                { label: 'Quota requests', value: stats.pending_quotas, detail: 'Awaiting admin review', icon: ClipboardCheck, href: '/admin/quotas' },
                { label: 'Accepted students', value: stats.accepted_students, detail: 'Students placed this semester', icon: Users, href: '/admin/applications' },
                { label: 'Available quota slots', value: stats.available_quotas, detail: 'Approved and released positions', icon: BriefcaseBusiness, href: '/admin/quotas' },
            ]}
        >
            <div className="grid gap-6 xl:grid-cols-2">
                <DashboardPanel
                    title="Placement rate"
                    description={`${selectedSemesterName} · ${stats.total_students} students expected to intern`}
                    action={<span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{stats.placement_rate}%</span>}
                >
                    <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center">
                        <div className="h-52 min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                                    />
                                    <Bar dataKey="value" name="Students" radius={[6, 6, 0, 0]}>
                                        {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                            <div className="rounded-xl bg-slate-50 px-4 py-3">
                                <p className="text-xs font-medium text-slate-500">Accepted</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{stats.accepted_students}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-3">
                                <p className="text-xs font-medium text-slate-500">Unplaced</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{stats.unplaced_students}</p>
                            </div>
                        </div>
                    </div>
                </DashboardPanel>

                <DashboardPanel title="Recent application activity" description={`Latest application status changes for ${selectedSemesterName}.`}>
                    {activities.length === 0 ? (
                        <DashboardEmptyState message="No recent application activity." />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {activities.slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{item.initials}</span>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{item.student_name}</p>
                                            <p className="mt-1 truncate text-sm text-slate-500">Applied to {item.company_name}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{item.status}</span>
                                        {item.date && <p className="mt-1 text-xs text-slate-400">{item.date}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardPanel>
            </div>

            <section className="space-y-4">
                <header>
                    <h2 className="text-lg font-semibold text-slate-900">Needs attention</h2>
                    <p className="mt-1 text-sm text-slate-500">Review logbook status and internship items that may need follow-up.</p>
                </header>
                <DashboardPanel title="Weekly logbook tracking" description={`Submission review status for ${selectedSemesterName}.`}>
                    <div className="grid gap-3 p-5 sm:grid-cols-3">
                        <LogbookStat label="Awaiting review" value={stats.weekly_logbooks_awaiting_review} icon={<ClipboardList className="size-4" />} tone="blue" />
                        <LogbookStat label="Approved" value={stats.weekly_logbooks_approved} icon={<CheckCircle2 className="size-4" />} tone="green" />
                        <LogbookStat label="Needs fixes" value={stats.weekly_logbooks_needing_fixes} icon={<AlertTriangle className="size-4" />} tone="amber" />
                    </div>
                </DashboardPanel>
                <div className="grid gap-4 xl:grid-cols-2">
                    <ProgressPanel
                        title="Internships this semester"
                        students={progress.current_internships}
                        emptyMessage="No internships are scheduled for this semester."
                        viewHref={route('admin.students')}
                        renderDetails={(student) => <>{student.company_name ?? 'Company not linked'} · {formatDate(student.start_date)} – {formatDate(student.end_date)}</>}
                    />
                    <ProgressPanel
                        title="Missing logbooks"
                        students={progress.missing_logbooks}
                        emptyMessage="No interns have overdue logbooks for this semester."
                        viewHref={route('admin.students')}
                        renderDetails={(student) => <>{student.missing_weeks} missing week{student.missing_weeks === 1 ? '' : 's'} · oldest: {formatDate(student.oldest_missing_week ?? null)}</>}
                    />
                    <ProgressPanel
                        title="Approaching completion"
                        students={progress.approaching_completion}
                        emptyMessage="No internships are ending within the next four weeks."
                        viewHref={route('admin.students')}
                        renderDetails={(student) => <>Ends {formatDate(student.end_date)} · {student.company_name ?? 'Company not linked'}</>}
                    />
                    <ProgressPanel
                        title="Needs intervention"
                        students={progress.requiring_intervention}
                        emptyMessage="No students in this semester are in classes flagged for intervention."
                        viewHref={selectedSemester ? route('admin.interventions', { semester: selectedSemester }) : route('admin.interventions')}
                        renderDetails={(student) => <>{student.programme_name ?? 'Programme not set'} · {student.company_name ?? 'Company not linked'}</>}
                    />
                </div>
            </section>
        </RoleDashboard>
    );
}

function LogbookStat({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: 'blue' | 'green' | 'amber' }) {
    const toneClass = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-800',
    }[tone];

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
            <div>
                <p className="text-sm font-medium text-slate-600">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <span className={`flex size-9 items-center justify-center rounded-lg ${toneClass}`}>{icon}</span>
        </div>
    );
}

function ProgressPanel({
    title,
    students,
    emptyMessage,
    viewHref,
    renderDetails,
}: {
    title: string;
    students: ProgressStudent[];
    emptyMessage: string;
    viewHref: string;
    renderDetails: (student: ProgressStudent) => React.ReactNode;
}) {
    return (
        <DashboardPanel
            title={title}
            action={(
                <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">{students.length}</span>
                    <Link href={viewHref} className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all</Link>
                </div>
            )}
        >
            {students.length === 0 ? (
                <DashboardEmptyState message={emptyMessage} />
            ) : (
                <div className="divide-y divide-slate-100">
                    {students.slice(0, 3).map((student) => (
                        <Link key={student.student_id} href={route('admin.students.show', student.student_id)} className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-slate-50 sm:px-6">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-slate-900">{student.full_name}</p>
                                    {student.monitoring_status && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${student.monitoring_status === 'At Risk' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>{student.monitoring_status}</span>}
                                </div>
                                <p className="mt-1 truncate text-xs text-slate-500">{student.student_code ?? 'No student ID'} · {student.programme_name ?? 'Programme not set'}</p>
                                <p className="mt-1 truncate text-sm text-slate-600">{renderDetails(student)}</p>
                            </div>
                            <ArrowRight className="size-4 shrink-0 text-slate-400" />
                        </Link>
                    ))}
                    {students.length > 3 && <p className="px-5 py-3 text-xs text-slate-500 sm:px-6">Showing 3 of {students.length} students.</p>}
                </div>
            )}
        </DashboardPanel>
    );
}

function formatDate(value: string | null) {
    if (!value) return '—';

    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(year, month - 1, day));
}

AdminDashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
