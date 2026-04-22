import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PlacementDataTable from '@/Components/placement-data-table';
import { 
    User, UserCheck, SearchIcon, RotateCcw, ChevronRight, 
    XCircle, CheckCircle2, AlertCircle, Building2, Check, X 
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

interface Placement {
    id: number;
    student_name: string;
    programme: string;
    company_name: string;
    status: 'Approved' | 'Pending' | 'Rejected';
}

interface Quota {
    quota_id: number;
    job_title: string;
    total_slots: number;
    quota_status: string;
    company?: {
        company_name: string;
    };
}

interface PlacementsProps {
    stats: {
        total_students: number;
        total_applied: number;
        total_approved: number;
        pending_review: number;
        pending_quotas: number;
    };
    placements: Placement[];
    quotas: Quota[];
}

export default function Placements({
    stats = { total_students: 0, total_applied: 0, total_approved: 0, pending_review: 0, pending_quotas: 0 },
    placements = [],
    quotas = [] 
}: PlacementsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgramme, setFilterProgramme] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleApprove = (id: number) => {
        if(confirm('Approve this company quota request?')) {
            router.post(`/admin/placements/${id}/approve`);
        }
    };

    const handleReject = (id: number) => {
        if(confirm('Reject this company quota request?')) {
            router.post(`/admin/placements/${id}/reject`);
        }
    };

    const filteredData = useMemo(() => {
        return placements.filter(item => {
            const matchesSearch = item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 item.company_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProgramme = filterProgramme === 'all' || item.programme === filterProgramme;
            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
            return matchesSearch && matchesProgramme && matchesStatus;
        });
    }, [searchTerm, filterProgramme, filterStatus, placements]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterProgramme('all');
        setFilterStatus('all');
    };

    const PendingRequests = () => {
        const pending = quotas.filter(q => q.quota_status === 'Pending');

        if (pending.length === 0) return null;

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 uppercase">Quota Requests</h2>
                    <Badge className="bg-amber-500 hover:bg-amber-600">{pending.length}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pending.map((quota) => (
                        <div key={quota.quota_id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <Building2 className="text-slate-400 size-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{quota.job_title}</h4>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">
                                        {quota.company?.company_name} • {quota.total_slots} Slots
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-8"
                                    onClick={() => handleApprove(quota.quota_id)}
                                >
                                    <Check className="size-4 mr-1" /> Approve
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 h-8"
                                    onClick={() => handleReject(quota.quota_id)}
                                >
                                    <X className="size-4 mr-1" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const PlacementPipeline = () => {
        const stages = [
            { label: "Applied", count: stats.total_applied, color: "text-slate-600" },
            { label: "ILD Review", count: 76, color: "text-amber-600" },
            { label: "Sent to Company", count: 56, color: "text-blue-600" },
            { label: "Under Review", count: 25, color: "text-indigo-600" },
            { label: "Result", count: stats.total_approved, color: "text-emerald-600" },
        ];

        return (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm w-full">
                <div className="flex items-center justify-between w-full overflow-x-auto">
                    {stages.map((stage, i) => (
                        <div key={stage.label} className="flex items-center flex-1 last:flex-none min-w-fit">
                            <div className="flex flex-col items-center text-center px-4">
                                <span className={`text-2xl font-bold ${stage.color}`}>{stage.count}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
                                    {stage.label}
                                </span>
                            </div>
                            {i < stages.length - 1 && (
                                <ChevronRight className="text-slate-300 mx-auto flex-shrink-0" size={20} strokeWidth={1.5} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            <Head title="Placements" />

            <header className="flex justify-between items-end w-full">
                <h1 className="text-3xl font-jakarta font-extrabold text-slate-900 tracking-tight">Placements</h1>
            </header>

            {/* Pending requests for admin to review quota submitted by Company */}
            <PendingRequests />

            <div className="w-full rounded-xl flex flex-wrap items-end gap-4">
                <div className="w-40 flex-shrink-0 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Programme</label>
                    <Select value={filterProgramme} onValueChange={setFilterProgramme}>
                        <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Programme" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="DWTY02">DWTY02</SelectItem>
                            <SelectItem value="DANF03">DANF03</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-[2] min-w-[300px] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Search</label>
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search student or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white w-full"
                        />
                    </div>
                </div>

                <Button variant="outline" onClick={resetFilters} className="flex-shrink-0">
                    <RotateCcw className="mr-2 size-4" /> Reset Filter
                </Button>
            </div>

            <PlacementPipeline />

            <div className="flex flex-col space-y-4 w-full">
                <h2 className="text-xl font-bold text-slate-900 uppercase">Student Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <div className="p-2 bg-red-100 rounded-full text-red-600 flex-shrink-0"><XCircle size={20} /></div>
                        <div><p className="text-xs text-slate-500 font-bold">Rejected</p><p className="text-xl font-bold">6</p></div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 flex-shrink-0"><CheckCircle2 size={20} /></div>
                        <div><p className="text-xs text-slate-500 font-bold">Accepted</p><p className="text-xl font-bold">12</p></div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <div className="p-2 bg-amber-100 rounded-full text-amber-600 flex-shrink-0"><AlertCircle size={20} /></div>
                        <div><p className="text-xs text-slate-500 font-bold">Without Placements</p><p className="text-xl font-bold">67</p></div>
                    </div>
                </div>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                <PlacementDataTable data={filteredData} />
            </div>
        </div>
    );
}

Placements.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;