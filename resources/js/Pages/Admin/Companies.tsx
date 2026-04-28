import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import CompanyDataTable from '@/Components/company-data-table';
import DashboardCard from '@/Components/DashboardCards';
import { Building2, LayoutGrid, User, UserCheck, SearchIcon, RotateCcw, Plus } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { DataTable } from '@/Components/ui/data-table';
import { QuotaActions } from '@/Components/ApproveRejectActions';
import { AnimatedTabsList } from '@/Components/ui/animated-tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";

// --- Types ---
interface Company {
    company_id: number;
    company_name: string;
    industry_sector: string;
    office_address: string;
    available: number;
    status?: string;
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

interface Stats {
    total_companies: number;
    total_quota: number;
    total_filled: number;
    available_slots: number;
}

interface Props {
    stats: Stats;
    companies: Company[];
    quotas: Quota[];
}

export default function Companies({ stats, companies, quotas = [] }: Props) {
    const pendingQuotas = useMemo(() => quotas.filter(q => q.quota_status === 'Pending'), [quotas]);
    const approvedQuotas = useMemo(() => quotas.filter(q => q.quota_status === 'Approved'), [quotas]);

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('all_companies');
    const [lastSeenCount, setLastSeenCount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('lastSeenQuotaCount');
        if (saved) setLastSeenCount(parseInt(saved, 10));
    }, []);

    const pendingCount = pendingQuotas.length;
    const showBadge = pendingCount > lastSeenCount;

    const [formData, setFormData] = useState({
        company_name: '',
        industry_sector: '',
        office_address: '',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSearching, setIsSearching] = useState(false);

    const columns = useMemo(() => [
        { accessorKey: "job_title", header: "Job Title" },
        { accessorKey: "company.company_name", header: "Company" },
        { accessorKey: "total_slots", header: "Slots" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <QuotaActions
                    quota={row.original}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            ),
        },
    ], []);

    const companyColumns = useMemo(() => [
        { accessorKey: "company_name", header: "Company Name" },
        { accessorKey: "industry_sector", header: "Industry Sector" },
        { accessorKey: "office_address", header: "Office Address" },
        { accessorKey: "total_quota", header: "Total Quota" },
        { accessorKey: "filled", header: "Filled" },
        { accessorKey: "available", header: "Available" },
    ], []);

    const allQuotasColumns = useMemo(() => [
        { accessorKey: "company.company_name", header: "Company" },
        { accessorKey: "job_title", header: "Job Title" },
        { accessorKey: "programme.programme_name", header: "Programme" },
        { accessorKey: "total_slots", header: "Slots" },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString()
        },
    ], []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);

        if (value === 'pending_quotas') {
            const currentCount = pendingQuotas.length;
            setLastSeenCount(currentCount);
            localStorage.setItem('lastSeenQuotaCount', currentCount.toString());
        }
    };

    const handleApprove = (id: number) => {
        router.post(route('admin.placements.approve', { quota: id }), {}, {
        preserveScroll: true,
    });
    };

    const handleReject = (id: number) => {
        router.post(route('admin.placements.reject', { quota: id }), {}, {
        preserveScroll: true,
    });
    };

    const processedCompanies = useMemo(() => {
        return companies
            .map((company: Company) => ({
                ...company,
                status: company.available === 0 ? 'Full' : 'Available'
            }))
            .filter(company => {
                const matchesSearch =
                    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    company.office_address.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = filterCategory === 'all' || company.industry_sector === filterCategory;
                const matchesStatus = filterStatus === 'all' || (filterStatus.toLowerCase() === company.status?.toLowerCase());
                return matchesSearch && matchesCategory && matchesStatus;
            });
    }, [searchTerm, filterCategory, filterStatus, companies]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('all');
        setFilterStatus('all');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('admin.companies.store'), formData as any, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                setOpen(false);
                setFormData({ company_name: '', industry_sector: '', office_address: '' });
            },
        });
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <header>
                    <h1 className="text-3xl font-sato font-bold">Company and Quota</h1>
                </header>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="flex items-center gap-1.5">
                            <Plus className="size-3.5" />
                            Add Company
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Register New Company</DialogTitle>
                                <DialogDescription>Add a new partner organization to the system.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="co-name">Company Name</Label>
                                    <Input id="co-name" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="co-category">Industrial Category</Label>
                                    <Select
                                        value={formData.industry_sector}
                                        onValueChange={(value) => setFormData({ ...formData, industry_sector: value })}
                                    >
                                        <SelectTrigger id="co-category" className="shadow-none">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Tech">Technology</SelectItem>
                                            <SelectItem value="Service">Service</SelectItem>
                                            <SelectItem value="Design">Design</SelectItem>
                                            <SelectItem value="Oil & Gas">Oil & Gas</SelectItem>
                                            <SelectItem value="Government">Government</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="co-location">District</Label>
                                    <Select
                                        value={formData.office_address}
                                        onValueChange={(value) => setFormData({ ...formData, office_address: value })}
                                    >
                                        <SelectTrigger id="co-location" className="shadow-none">
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Brunei Muara">Brunei Muara</SelectItem>
                                            <SelectItem value="Belait">Belait</SelectItem>
                                            <SelectItem value="Tutong">Tutong</SelectItem>
                                            <SelectItem value="Temburong">Temburong</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting} className="w-full">
                                    {submitting ? 'Registering...' : 'Complete Registration'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard title="Total Companies" value={stats.total_companies} icon={<Building2 size={18} />} />
                <DashboardCard title="Total Quota" value={stats.total_quota} icon={<User size={18} />} />
                <DashboardCard title="Total Filled" value={stats.total_filled} icon={<UserCheck size={18} />} />
                <DashboardCard title="Available Slots" value={stats.available_slots} icon={<LayoutGrid size={18} />} />
            </div>

            <div className="mt-6">
                <AnimatedTabsList
                    groupId="companies"
                    activeValue={activeTab}
                    setActiveValue={handleTabChange}
                    tabs={[
                        { value: "all_companies", label: "All Companies" },
                        {
                            value: "pending_quotas",
                            label: "Pending reviews",
                            count: showBadge ? pendingCount : 0
                        },
                        { value: "all_quotas", label: "All Quotas" },
                    ]}
                />
            </div>

            <div className="mt-4">
                {activeTab === 'all_companies' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-end gap-4 bg-white rounded-xl py-2">
                            <div className="flex-1 min-w-[240px] space-y-2">
                                <label className="ml-1 text-xs font-semibold text-gray-500 uppercase">Search Company</label>
                                <div className="relative">
                                    <SearchIcon className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 size-4" />
                                    <Input
                                        placeholder="Type company name or district..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-9 pr-9 shadow-none focus-visible:ring-transparent"
                                    />
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500 hover:text-red-600">
                                <RotateCcw className="size-3.5" /> Reset
                            </Button>
                        </div>

                        <div className="rounded-xl bg-white">
                            {processedCompanies.length > 0 ? (
                                <DataTable columns={companyColumns} data={processedCompanies} />
                            ) : (
                                <p className="text-center py-10 text-slate-500">No companies found.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'pending_quotas' && (
                    <div className="rounded-xl bg-white py-2">
                        {pendingQuotas.length > 0 ? (
                            <DataTable columns={columns} data={pendingQuotas} />
                        ) : (
                            <p className="text-center py-10 text-slate-500">No pending requests.</p>
                        )}
                    </div>
                )}

                {activeTab === 'all_quotas' && (
                    <div className="rounded-xl bg-white py-2">
                        {approvedQuotas.length > 0 ? (
                            <DataTable
                                columns={allQuotasColumns}
                                data={approvedQuotas}
                            />
                        ) : (
                            <p className="text-center py-10 text-slate-500">No approved quotas found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

Companies.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;