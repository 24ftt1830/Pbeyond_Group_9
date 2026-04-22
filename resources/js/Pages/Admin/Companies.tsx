import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import CompanyDataTable from '@/Components/company-data-table';
import DashboardCard from '@/Components/DashboardCards';
import { Building2, LayoutGrid, User, UserCheck, SearchIcon, LoaderCircleIcon, RotateCcw, Plus } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
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

interface Stats {
    total_companies: number;
    total_quota: number;
    total_filled: number;
    available_slots: number;
}

interface Props {
    stats: Stats;
    companies: Company[];
}

export default function Companies({ stats, companies }: Props) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        industry_sector: '',
        office_address: '',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSearching, setIsSearching] = useState(false);

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

                const matchesCategory = filterCategory === 'all' ||
                    company.industry_sector === filterCategory;

                const matchesStatus = filterStatus === 'all' ||
                    (filterStatus.toLowerCase() === company.status?.toLowerCase());

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
            onError: (errors) => {
                console.error(errors);
                alert('Failed to add company.');
            },
        });
    };

    return (
        <div className="p-6 space-y-8">
            {/* 1. Page Header */}
            <div className="flex items-center justify-between">
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
                        {/* ... your form code remains the same ... */}
                    </DialogContent>
                </Dialog>
            </div>

            {/* 2. Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard title="Total Companies" value={stats.total_companies} icon={<Building2 size={18} />} />
                <DashboardCard title="Total Quota" value={stats.total_quota} icon={<User size={18} />} />
                <DashboardCard title="Total Filled" value={stats.total_filled} icon={<UserCheck size={18} />} />
                <DashboardCard title="Available Slots" value={stats.available_slots} icon={<LayoutGrid size={18} />} />
            </div>

            {/* 3. Company Overview Section (Grouped Title + Filter Bar) */}
            <div className="space-y-4">
                <h1 className="text-xl font-semibold text-slate-900">Company Overview</h1>

                <div className="flex flex-wrap items-end gap-4 border-none">
                    <div className="flex-1 min-w-[240px] space-y-2">
                        <label className="ml-1 text-xs font-semibold text-gray-500 uppercase">Search Company</label>
                        <div className="relative">
                            <SearchIcon className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 size-4" />
                            <Input
                                placeholder="Type company name or district..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-9 pr-9"
                            />
                            {isSearching && <LoaderCircleIcon className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 size-4 animate-spin" />}
                        </div>
                    </div>

                    <div className="w-48 space-y-2">
                        <label className="ml-1 text-xs font-semibold text-gray-500 uppercase">Category</label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Tech">Tech</SelectItem>
                                <SelectItem value="Service">Service</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-48 space-y-2">
                        <label className="ml-1 text-xs font-semibold text-gray-500 uppercase">Availability</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Status</SelectItem>
                                <SelectItem value="available">Available Slots</SelectItem>
                                <SelectItem value="full">Fully Filled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button variant="ghost" onClick={resetFilters} className="text-gray-500 hover:text-red-600">
                        <RotateCcw className="mr-2 size-4" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* 4. Data Table */}
            <div className="w-full">
                <CompanyDataTable data={processedCompanies} />
            </div>
        </div>
    );
}

Companies.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;