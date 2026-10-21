import { confirmAction } from '@/lib/confirm-action';
import QuotaDeadlineNotice from '@/Components/QuotaDeadlineNotice';
import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import CompanyDataTable from '@/Components/company-data-table';
import DashboardCard from '@/Components/DashboardCards';
import { ArrowRight, Building2, LayoutGrid, User, UserCheck, SearchIcon, RotateCcw, Plus, FileUp } from 'lucide-react';
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
import { Errors, RecordFeedback } from '@/Components/Admin/RecordControls';
import { districts } from '@/Components/CompanyBranchEditor';

// --- Types ---
interface Company {
    company_id: number;
    company_name: string;
    industry_sector: string;
    office_address: string;
    available: number;
    status?: string;
    district?: string;
    branches?: { district?: string; name: string }[];
    schools?: string[];
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
    const { errors: pageErrors } = usePage().props;
    const pendingQuotas = useMemo(() => quotas.filter(q => q.quota_status === 'Pending'), [quotas]);
    const approvedQuotas = useMemo(() => quotas.filter(q => q.quota_status === 'Approved'), [quotas]);

    const [open, setOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all_companies');
    const [lastSeenCount, setLastSeenCount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('lastSeenQuotaCount');
        if (saved) setLastSeenCount(parseInt(saved, 10));
    }, []);

    const pendingCount = pendingQuotas.length;
    const showBadge = pendingCount > lastSeenCount;

    const companyForm = useForm({
        company_name: '',
        industry_sector: '',
        office_address: '',
        district: '',
    });
    const companyImportForm = useForm({ file: null as File | null });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterSchool, setFilterSchool] = useState('');
    const schoolNames = [...new Set(companies.flatMap((company) => company.schools ?? []))].sort();
    const [isSearching, setIsSearching] = useState(false);

    const columns = useMemo(() => [
        { accessorKey: "job_title", header: "Job Title" },
        { accessorKey: "company.company_name", header: "Company" },
        { id: 'term', header: 'Internship term', cell: ({ row }: any) => <div className="space-y-1"><p>{row.original.academic_semester?.name ?? 'Not assigned'}</p><QuotaDeadlineNotice term={row.original.academic_semester} compact /></div> },
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
        { accessorKey: 'district', header: 'District' },
        { accessorKey: "total_quota", header: "Total Quota" },
        { accessorKey: "filled", header: "Filled" },
        { accessorKey: "available", header: "Available" },
        {
            id: "manage",
            header: "Actions",
            cell: ({ row }: any) => <Link href={route('admin.companies.manage', row.original.company_id)} aria-label={`Manage ${row.original.company_name}`} className="ui-button ui-button-primary h-9 gap-2 rounded-lg px-3.5 text-sm font-semibold shadow-sm hover:shadow">Manage<ArrowRight aria-hidden="true" className="size-4" /></Link>,
        },
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

    const handleReject = async (id: number) => {
        if (!(await confirmAction('Reject this quota request and hide it from students?'))) return;
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
                const matchesDistrict = !filterDistrict || [company.district, ...(company.branches ?? []).map((branch) => branch.district)].includes(filterDistrict);
                const matchesSchool = !filterSchool || (company.schools ?? []).includes(filterSchool);
                return matchesSearch && matchesCategory && matchesStatus && matchesDistrict && matchesSchool;
            });
    }, [searchTerm, filterCategory, filterStatus, companies, filterDistrict, filterSchool]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('all');
        setFilterStatus('all');
        setFilterDistrict('');
        setFilterSchool('');
    };
    const hasActiveFilters = Boolean(searchTerm || filterSchool || filterDistrict || filterCategory !== 'all' || filterStatus !== 'all');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        companyForm.post(route('admin.companies.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                companyForm.reset();
                companyForm.clearErrors();
            },
        });
    };

    const handleCompanyImport = (e: React.FormEvent) => {
        e.preventDefault();
        companyImportForm.post(route('admin.companies.import'), {
            preserveScroll: true,
            onSuccess: () => {
                setImportOpen(false);
                companyImportForm.reset();
                companyImportForm.clearErrors();
            },
        });
    };

    return (
        <div className="p-6">
            <RecordFeedback />
            <Errors errors={pageErrors as Record<string, string>} />
            <div className="flex items-center justify-between mb-6">
                <header>
                    <h1 className="text-3xl font-sans font-semibold">Company and Quota</h1>
                </header>

                <div className="flex items-center gap-2">
                <Dialog open={importOpen} onOpenChange={setImportOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                            <FileUp className="size-3.5" />
                            Import CSV
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <form onSubmit={handleCompanyImport}>
                            <DialogHeader>
                                <DialogTitle>Import Companies</DialogTitle>
                                <DialogDescription>
                                    Import company records only. HR accounts are created separately from Manage Users.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                    CSV columns: <span className="font-medium text-foreground">company_name, industry_sector, office_address, district (optional)</span>
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="companies-csv">Company CSV file</Label>
                                    <Input
                                        id="companies-csv"
                                        type="file"
                                        accept=".csv,.txt,.xlsx,.xls"
                                        onChange={(event) => companyImportForm.setData('file', event.currentTarget.files?.[0] ?? null)}
                                        required
                                    />
                                </div>
                                <Errors errors={companyImportForm.errors} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" disabled={companyImportForm.processing} onClick={() => setImportOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={companyImportForm.processing || !companyImportForm.data.file}>
                                    {companyImportForm.processing ? 'Importing...' : 'Import Companies'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="flex items-center gap-1.5">
                            <Plus className="size-3.5" />
                            Add Company
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Register New Company</DialogTitle>
                                <DialogDescription>Add a company record. Create its HR login later from Manage Users.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="co-name">Company Name</Label>
                                    <Input id="co-name" maxLength={150} value={companyForm.data.company_name} onChange={(e) => companyForm.setData('company_name', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="co-category">Industrial Category</Label>
                                    <Select
                                        required
                                        value={companyForm.data.industry_sector}
                                        onValueChange={(value) => companyForm.setData('industry_sector', value)}
                                    >
                                        <SelectTrigger id="co-category" className="">
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
                                        required
                                        value={companyForm.data.district}
                                        onValueChange={(value) => companyForm.setData('district', value)}
                                    >
                                        <SelectTrigger id="co-location" className="">
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Brunei-Muara">Brunei-Muara</SelectItem>
                                            <SelectItem value="Belait">Belait</SelectItem>
                                            <SelectItem value="Tutong">Tutong</SelectItem>
                                            <SelectItem value="Temburong">Temburong</SelectItem>
                                            <SelectItem value="Overseas">Overseas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mb-4 grid gap-2"><Label htmlFor="co-address">Office address</Label><Input id="co-address" value={companyForm.data.office_address} onChange={(event) => companyForm.setData('office_address', event.target.value)} required /></div>
                            <Errors errors={companyForm.errors} />
                            <DialogFooter>
                                <Button type="button" variant="outline" disabled={companyForm.processing} onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={companyForm.processing}>
                                    {companyForm.processing ? 'Creating...' : 'Create Company'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                </div>
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
                        <section aria-label="Company filters" className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_minmax(12rem,16rem)_minmax(10rem,12rem)_auto]">
                                <div className="min-w-0 space-y-2 sm:col-span-2 xl:col-span-1">
                                    <Label htmlFor="company-search" className="text-xs font-medium text-slate-500">Search</Label>
                                    <div className="relative">
                                        <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="company-search"
                                            type="search"
                                            placeholder="Search companies..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="h-10 pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="min-w-0 space-y-2">
                                    <Label htmlFor="company-school" className="text-xs font-medium text-slate-500">School</Label>
                                    <select id="company-school" value={filterSchool} onChange={(event) => setFilterSchool(event.target.value)} className="ui-field h-10 w-full">
                                        <option value="">All schools</option>
                                        {schoolNames.map((school) => <option key={school}>{school}</option>)}
                                    </select>
                                </div>
                                <div className="min-w-0 space-y-2">
                                    <Label htmlFor="company-district" className="text-xs font-medium text-slate-500">District</Label>
                                    <select id="company-district" value={filterDistrict} onChange={(event) => setFilterDistrict(event.target.value)} className="ui-field h-10 w-full">
                                        <option value="">All districts</option>
                                        {districts.map((district) => <option key={district}>{district}</option>)}
                                    </select>
                                </div>
                                {hasActiveFilters && <Button type="button" variant="ghost" onClick={resetFilters} className="h-10 justify-self-start px-3 text-slate-500 hover:text-primary sm:col-span-2 xl:col-span-1">
                                    <RotateCcw aria-hidden="true" className="size-4" />Clear filters
                                </Button>}
                            </div>
                        </section>
                        <p role="status" aria-live="polite" className="px-1 text-xs text-slate-500">{processedCompanies.length} {processedCompanies.length === 1 ? 'company' : 'companies'}{hasActiveFilters ? ` found · ${companies.length} total` : ' total'}</p>

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
