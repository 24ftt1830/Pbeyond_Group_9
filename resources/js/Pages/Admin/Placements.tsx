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
    placements: (Placement & { status: string })[];
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

    return (
        <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            <Head title="Placements" />

            <header className="flex justify-between items-end w-full">
                <h1 className="text-3xl font-jakarta font-extrabold text-slate-900 tracking-tight">Placements</h1>
            </header>

            <div className="w-full rounded-xl flex flex-wrap items-end gap-4">
                <div className="flex-[2] min-w-[300px] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Search</label>
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="Search student or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white w-full focus-visible:ring-0 shadow-none"
                        />
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