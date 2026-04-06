import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Building2, ClipboardCheck, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AdminDashboard({ auth, stats, activities, chartData }: any) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-zinc-800 leading-tight">Admin Insights</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="p-8 bg-zinc-50 min-h-screen">
                {/* Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Pending Companies" value={stats.pending_companies} icon={<Building2 />} color="orange" link="/admin/companies" />
                    <StatCard label="Quota Requests" value={stats.pending_quotas} icon={<ClipboardCheck />} color="blue" link="/admin/quotas" />
                    <StatCard label="Total Students" value={stats.total_students} icon={<Users />} color="purple" link="/admin/students" />
                    <StatCard label="Unplaced Students" value={stats.unplaced_students} icon={<AlertCircle />} color="red" link="/admin/applications" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Donut Chart */}
                    <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="h-4 w-4 text-zinc-400" />
                            <h3 className="font-bold text-zinc-800 uppercase text-xs tracking-widest">Placement Rate</h3>
                        </div>
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={10}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={8} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {chartData.map((item: any) => (
                                <div key={item.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        {item.name}
                                    </div>
                                    <span className="font-bold text-zinc-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center">
                            <h3 className="font-bold text-zinc-800 uppercase text-xs tracking-widest">Live Activity</h3>
                        </div>
                        <div className="divide-y divide-zinc-50 overflow-y-auto max-h-[450px]">
                            {activities.map((item: any) => (
                                <div key={item.id} className="px-8 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-xs">
                                            {item.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{item.student_name}</p>
                                            <p className="text-xs text-zinc-500">applied to <span className="font-medium text-zinc-700">{item.company_name}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                                            item.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                                            item.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <p className="text-[10px] text-zinc-400 mt-1 uppercase">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon, color, link }: any) {
    const colors: any = {
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        red: 'bg-red-50 text-red-600 border-red-100'
    };

    return (
        <Link href={link} className="p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
                    <h4 className="text-3xl font-black text-zinc-900">{value}</h4>
                </div>
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition">
                Manage <ArrowRight className="ml-1 h-3 w-3" />
            </div>
        </Link>
    );
}
