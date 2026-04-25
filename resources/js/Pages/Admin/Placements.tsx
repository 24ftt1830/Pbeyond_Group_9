import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PlacementDataTable from '@/Components/placement-data-table';
import { SearchIcon, RotateCcw, Building2, Check, X } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

interface Placement {
    id: number;
    student_name: string;
    programme: string;
    company_name: string;
    // status removed
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
    placements: (Placement & { status: string })[]; // Kept locally for logic, but not for display
    quotas: Quota[];
}

export default function Placements({
    stats,
    placements = [],
    quotas = [] 
}: PlacementsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgramme, setFilterProgramme] = useState('all');

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
            // 1. Only include 'Recruited'
            const isRecruited = item.status === 'Recruited';
            
            // 2. Search & Programme filters
            const matchesSearch = item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 item.company_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProgramme = filterProgramme === 'all' || item.programme === filterProgramme;
            
            return isRecruited && matchesSearch && matchesProgramme;
        });
    }, [searchTerm, filterProgramme, placements]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterProgramme('all');
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

    return (
        <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            <Head title="Placements" />

            <header className="flex justify-between items-end w-full">
                <h1 className="text-3xl font-jakarta font-extrabold text-slate-900 tracking-tight">Placements</h1>
            </header>

            <PendingRequests />

            {/* Filter Section */}
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

            <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                <PlacementDataTable data={filteredData} />
            </div>
        </div>
    );
}

Placements.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;