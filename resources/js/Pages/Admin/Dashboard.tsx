import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Building2, ClipboardCheck, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

const MOCK_DATA = {
    stats: {
        pending_companies: 12,
        pending_quotas: 8,
        total_students: 156,
        unplaced_students: 42
    },
    chart: [
        { name: 'Placed', value: 114, color: '#10b981' },
        { name: 'Unplaced', value: 42, color: '#f43f5e' },
    ],
    activities: [
        { id: 1, initials: 'JD', student_name: 'John Doe', company_name: 'TechCorp Solutions', status: 'Accepted', date: '2 hours ago' },
        { id: 2, initials: 'AS', student_name: 'Alice Smith', company_name: 'Innovate Ltd', status: 'Pending', date: '5 hours ago' },
    ]
};

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="p-6">
                <h1 className="text-3xl font-sato font-bold mb-6">Overview</h1>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            label="Pending Companies" 
                            // Using the static object directly
                            value={MOCK_DATA.stats.pending_companies} 
                            icon={<Building2 className="size-4" />} 
                            link="/admin/companies" 
                        />
                        <StatCard label="Quota Requests" value={MOCK_DATA.stats.pending_quotas} icon={<ClipboardCheck className="size-4" />} link="/admin/quotas" />
                        <StatCard label="Total Students" value={MOCK_DATA.stats.total_students} icon={<Users className="size-4" />} link="/admin/students" />
                        <StatCard label="Unplaced Students" value={MOCK_DATA.stats.unplaced_students} icon={<AlertCircle className="size-4" />} link="/admin/applications" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1 shadow-none border-zinc-200">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-zinc-500" />
                                    <CardTitle className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Placement Rate</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={MOCK_DATA.chart} innerRadius={75} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                                                {MOCK_DATA.chart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2 shadow-none border-zinc-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Live Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-zinc-100">
                                    {MOCK_DATA.activities.map((item) => (
                                        <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-9 w-9 border border-zinc-200">
                                                    <AvatarFallback className="text-[10px]">{item.initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{item.student_name}</p>
                                                    <p className="text-xs text-zinc-500">Applied to {item.company_name}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{item.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({ label, value, icon, link }: any) {
    return (
        <Link href={link}>
            <Card className="shadow-none border-zinc-200 hover:border-zinc-300 transition-colors group">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
                            <h4 className="text-3xl font-bold text-zinc-900">{value}</h4>
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

AdminDashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;