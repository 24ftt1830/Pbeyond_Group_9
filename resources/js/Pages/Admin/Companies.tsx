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
                alert('Failed to register company.');
            },
        });
    };

    return (
        <div className="px-4 py-10 mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">
            <Head title="Company Management" />

            <div className="flex items-center justify-between">
                <header>
                    <h1 className="text-3xl font-extrabold text-slate-900">Company and Quota</h1>
                </header>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="size-4" />
                            Register Company
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Register New Company</DialogTitle>
                                <DialogDescription>
                                    Add a new partner organization to the system.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="co-name">Company Name</Label>
                                    <Input
                                        id="co-name"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="co-category">Industrial Category</Label>
                                    <Select
                                        value={formData.industry_sector}
                                        onValueChange={(value) => setFormData({ ...formData, industry_sector: value })}
                                    >
                                        <SelectTrigger id="co-category">
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
                                        <SelectTrigger id="co-location">
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
                                <Button type="submit" disabled={submitting}>
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

            <div>
                <h1 className="text-xl font-semibold text-slate-900">Company Overview</h1>
            </div>

            <div className="flex flex-wrap items-end gap-4 bg-white rounded-xl">
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

            <CompanyDataTable data={processedCompanies} />
        </div>
    );
}

Companies.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;