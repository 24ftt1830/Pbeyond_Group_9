import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
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
import { Label } from "@/components/ui/label";

export default function ManageUsers({
    stats = { total_companies: 12, total_quota: 150, total_filled: 85, available_slots: 65 },
    companies = [
        { id: 1, name: "Shell Livewire Brunei", total_quota: 50, filled: 45, available: 5, category: "Tech" },
        { id: 2, name: "Maybank", total_quota: 30, filled: 10, available: 20, category: "Service" },
        { id: 3, name: "Seria Energy Lab", total_quota: 20, filled: 20, available: 0, category: "Design" },
        { id: 4, name: "Jabatan Kemajuan Perumahan", total_quota: 50, filled: 10, available: 40, category: "Tech" },
        { id: 5, name: "MSU", total_quota: 50, filled: 10, available: 40, category: "Tech" },
        { id: 6, name: "Jerudong Park Medical Centre", total_quota: 50, filled: 10, available: 40, category: "Tech" },
        { id: 7, name: "EVYD Tech", total_quota: 50, filled: 10, available: 40, category: "Tech" },
        { id: 8, name: "Dynamik Technologies", total_quota: 50, filled: 10, available: 40, category: "Tech" },
        { id: 9, name: "Police Diraja Brunei", total_quota: 50, filled: 10, available: 40, category: "Tech" },
        { id: 10, name: "Baiduri Bank", total_quota: 50, filled: 10, available: 40, category: "Tech" },
        { id: 11, name: "Brunei Innovation Lab", total_quota: 50, filled: 10, available: 40, category: "Tech" },
    ]
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSearching, setIsSearching] = useState(false);

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || company.category === filterCategory;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'full' ? company.available === 0 : company.available > 0);

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

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            <Head title="Company Management" />

            <div className="flex items-center justify-between">
                <header>
                    <h1 className="text-3xl font-extrabold text-slate-900">Company and Quota</h1>
                </header>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="size-4" />
                            Register Company
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Register New Company</DialogTitle>
                            <DialogDescription>
                                Add a new partner organization to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="co-name">Company Name</Label>
                                <Input id="co-name" placeholder="e.g. Brunei Innovation Lab" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="co-category">Industrial Category</Label>
                                <Select>
                                    <SelectTrigger id="co-category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tech">Technology</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                        <SelectItem value="design">Design</SelectItem>
                                        <SelectItem value="oil_gas">Oil & Gas</SelectItem>
                                        <SelectItem value="government">Government</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="co-location">District</Label>
                                <Select>
                                    <SelectTrigger id="co-location">
                                        <SelectValue placeholder="Select District" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brunei_muara">Brunei Muara</SelectItem>
                                        <SelectItem value="belait">Belait</SelectItem>
                                        <SelectItem value="tutong">Tutong</SelectItem>
                                        <SelectItem value="temburong">Temburong</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full sm:w-auto">
                                Complete Registration
                            </Button>
                        </DialogFooter>
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

            <div className="bg-white rounded-xl flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[240px] space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-500 ml-1">Search Company</label>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                            placeholder="Type company name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-9 pr-9"
                        />
                        {isSearching && <LoaderCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-gray-400" />}
                    </div>
                </div>

                <div className="w-48 space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-500 ml-1">Category</label>
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
                    <label className="text-xs font-semibold uppercase text-gray-500 ml-1">Availability</label>
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

            <CompanyDataTable data={filteredCompanies} />
        </div>
    );
}

ManageUsers.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;