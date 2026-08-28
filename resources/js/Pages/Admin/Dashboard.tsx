import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Users,
    Building2,
    ClipboardCheck,
    AlertCircle,
    TrendingUp,
    BriefcaseBusiness,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';

type DashboardStats = {
    pending_companies: number;
    pending_quotas: number;
    total_students: number;
    unplaced_students: number;
    accepted_students: number;
    available_quotas: number;
    placement_rate: number;
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
    availableSemesters: number[];
    selectedSemester: number | null;
    activities: Activity[];
};

export default function AdminDashboard() {
    const {
        stats,
        availableSemesters,
        selectedSemester,
        activities,
    } = usePage().props as unknown as PageProps;

    const chartData = [
        {
            name: 'Accepted',
            value: stats.accepted_students,
        },
        {
            name: 'Unplaced',
            value: stats.unplaced_students,
        },
    ];

    const handleSemesterChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = event.target.value;

        router.get(
            '/admin/dashboard',
            value ? { semester: value } : {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="p-6">
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-sato font-bold">
                            Overview
                        </h1>

                        <p className="text-sm text-zinc-500 mt-1">
                            Internship placement overview
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="semester"
                            className="text-sm font-medium text-zinc-600"
                        >
                            Semester
                        </label>

                        <select
                            id="semester"
                            value={selectedSemester ?? ''}
                            onChange={handleSemesterChange}
                            className="h-10 min-w-[170px] rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                        >
                            <option value="">
                                All Current Semesters
                            </option>

                            {availableSemesters.map((semester) => (
                                <option
                                    key={semester}
                                    value={semester}
                                >
                                    Semester {semester}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Pending Companies"
                            value={stats.pending_companies}
                            icon={
                                <Building2 className="size-4" />
                            }
                            link="/admin/companies"
                        />

                        <StatCard
                            label="Quota Requests"
                            value={stats.pending_quotas}
                            icon={
                                <ClipboardCheck className="size-4" />
                            }
                            link="/admin/quotas"
                        />

                        <StatCard
                            label="Accepted Students"
                            value={stats.accepted_students}
                            icon={
                                <Users className="size-4" />
                            }
                            link="/admin/applications"
                        />

                        <StatCard
                            label="Available Quotas"
                            value={stats.available_quotas}
                            icon={
                                <BriefcaseBusiness className="size-4" />
                            }
                            link="/admin/quotas"
                        />
                    </div>

                    {/* Placement + Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Placement Rate */}
                        <Card className="lg:col-span-1 shadow-none border-zinc-200">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-zinc-500" />

                                    <CardTitle className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">
                                        Placement Rate
                                    </CardTitle>
                                </div>

                                <p className="text-xs text-zinc-500">
                                    {stats.total_students} current internship students
                                </p>
                            </CardHeader>

                            <CardContent>
                                <div className="h-[250px] w-full mt-4">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={chartData}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                vertical={false}
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                }}
                                            />

                                            <Tooltip
                                                cursor={{
                                                    opacity: 0.08,
                                                }}
                                                contentStyle={{
                                                    borderRadius: '8px',
                                                    border: '1px solid #e4e4e7',
                                                    fontSize: '12px',
                                                }}
                                            />

                                            <Bar
                                                dataKey="value"
                                                radius={[6, 6, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-zinc-900">
                                            {stats.accepted_students}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            Accepted
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-zinc-900">
                                            {stats.unplaced_students}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            Unplaced
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <p className="text-xs text-zinc-500">
                                        Placement Rate
                                    </p>

                                    <p className="text-lg font-semibold text-zinc-900">
                                        {stats.placement_rate}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Activity */}
                        <Card className="lg:col-span-2 shadow-none border-zinc-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">
                                    Live Activity
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="divide-y divide-zinc-100">
                                    {activities.length > 0 ? (
                                        activities.map((item) => (
                                            <div
                                                key={item.id}
                                                className="px-6 py-4 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-9 w-9 border border-zinc-200">
                                                        <AvatarFallback className="text-[10px]">
                                                            {item.initials}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {item.student_name}
                                                        </p>

                                                        <p className="text-xs text-zinc-500">
                                                            Applied to{' '}
                                                            {item.company_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant="outline">
                                                        {item.status}
                                                    </Badge>

                                                    {item.date && (
                                                        <span className="text-[10px] text-zinc-400">
                                                            {item.date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-12 text-center">
                                            <AlertCircle className="mx-auto h-8 w-8 text-zinc-300" />

                                            <p className="mt-2 text-sm text-zinc-500">
                                                No recent activity
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    label,
    value,
    icon,
    link,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    link: string;
}) {
    return (
        <Link href={link}>
            <Card className="shadow-none border-zinc-200 hover:border-zinc-300 transition-colors group">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                                {label}
                            </p>

                            <h4 className="text-3xl font-bold text-zinc-900">
                                {value}
                            </h4>
                        </div>

                        <div className="p-2.5 rounded-md border border-zinc-100 bg-zinc-50 group-hover:text-zinc-900 transition-colors">
                            {icon}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);