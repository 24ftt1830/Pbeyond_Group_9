import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PlacementDataTable from '@/Components/placement-data-table';
import { User, UserCheck, SearchIcon, LoaderCircleIcon, RotateCcw, ChevronRight, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";

export default function Placements({
    stats = { total_students: 120, total_applied: 67, total_approved: 50, pending_review: 35 },
    placements = [
        { id: 1, student_name: "Ahmad Fikri bin Abdullah", programme: "DWTY02", company_name: "MAYBANK", status: "Approved" as const },
        { id: 2, student_name: "Nur Aisyah binti Hamzah", programme: "DWTY02", company_name: "JPMC", status: "Pending" as const },
        { id: 3, student_name: "Muhammad Danish bin Rahman", programme: "DANF03", company_name: "SHELL LIVEWIRE", status: "Rejected" as const },
        { id: 4, student_name: "Siti Khadijah binti Ismail", programme: "DHCM05", company_name: "JABATAN KEMAJUAN PERUMAHAN", status: "Approved" as const },
        { id: 5, student_name: "Nor Aiman Hakim bin Salleh", programme: "DDAT04", company_name: "-", status: "Rejected" as const },
    ]
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgramme, setFilterProgramme] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSearching, setIsSearching] = useState(false);

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

    const PlacementPipeline = () => {
        const stages = [
            { label: "Applied", count: 67, color: "text-slate-600" },
            { label: "ILD Review", count: 76, color: "text-amber-600" },
            { label: "Sent to Company", count: 56, color: "text-blue-600" },
            { label: "Under Review", count: 25, color: "text-indigo-600" },
            { label: "Result", count: 17, color: "text-emerald-600" },
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

            <header className="w-full">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">PLACEMENTS</h1>
            </header>

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
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsSearching(true);
                                setTimeout(() => setIsSearching(false), 500);
                            }}
                            className="pl-9 bg-white w-full"
                        />
                    </div>
                </div>

                <Button variant="outline" onClick={resetFilters} className="flex-shrink-0">
                    <RotateCcw className="mr-2 size-4" />
                    Reset Filter
                </Button>
            </div>

            <PlacementPipeline />

            <div className="flex flex-col space-y-4 w-full">
                <h2 className="text-xl font-bold text-slate-900 uppercase">STUDENTS</h2>
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

            <div className="w-full overflow-hidden rounded-xl border border-slate-200">
                <PlacementDataTable data={filteredData} />
            </div>
        </div>
    );
}

Placements.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;