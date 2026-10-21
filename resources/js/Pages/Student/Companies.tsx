import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Search, Filter, X, Eye, LoaderCircleIcon, RotateCcw } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Input } from '@/Components/ui/input';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/Components/ui/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

// --- Types ---
interface Company {
    company_id: number;
    company_name: string;
    industry_sector: string;
    office_address: string;
    district?: string;
    branches?: { district?: string; address?: string }[];
    schools?: string[];
    available: number;
}

interface Props {
    companies: Company[];
    hasAssignedIntake?: boolean;
}

const districtOptions = ['Brunei-Muara', 'Tutong', 'Temburong', 'Belait', 'Overseas'];
const statusOptions = ['Available', 'Full'];

export default function Companies({ companies = [], hasAssignedIntake = true }: Props) {
    const { flash } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const columns = useMemo<ColumnDef<Company>[]>(() => [
        {
            accessorKey: 'company_name',
            header: 'Company Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                    {row.original.company_name}
                </span>
                {row.original.available === 0 ? (
                    <span className="ui-badge-danger ui-badge inline-flex items-center text-xs font-medium ">
                        Full
                    </span>
                ) : (
                    <span className="ui-badge-success ui-badge inline-flex items-center text-xs font-medium ">
                        Available
                    </span>
                )}
            </div>
            ),
        },
        {
            accessorKey: 'industry_sector',
            header: 'Sector',
        },
        {
            accessorKey: 'district',
            header: 'District',
            cell: ({ row }) => [...new Set([row.original.district, ...(row.original.branches ?? []).map((branch) => branch.district)].filter(Boolean))].join(', ') || 'Not assigned',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Link
                    href={route('student.companies.view', row.original.company_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-primary hover:bg-blue-100 transition-colors"
                >
                    <Eye className="size-4" /> View Details
                </Link>
            ),
        },
    ], []);

    const filteredCompanies = useMemo(() => {
        return companies
            .map(company => ({
                ...company,
                calculatedStatus: company.available === 0 ? 'Full' : 'Available'
            }))
            .filter(company => {
                const matchesSearch = !searchQuery ||
                    company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    company.office_address.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesDistrict = selectedDistricts.length === 0 ||
                    [company.district, ...(company.branches ?? []).map((branch) => branch.district)].some((district) => Boolean(district && selectedDistricts.includes(district)));

                const matchesStatus = selectedStatuses.length === 0 ||
                    selectedStatuses.includes(company.calculatedStatus);

                return matchesSearch && matchesDistrict && matchesStatus;
            });
    }, [companies, searchQuery, selectedDistricts, selectedStatuses]);

    const toggleSelection = (value: string, selected: string[], setSelected: (val: string[]) => void) => {
        setSelected(selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedDistricts([]);
        setSelectedStatuses([]);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 500);
    };

    const hasActiveFilters = selectedDistricts.length > 0 || selectedStatuses.length > 0;

    return (
        <div className="p-6">
            {flash?.error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}

            <div className="flex items-center justify-between mb-6">
                <header>
                    <h1 className="font-sans text-3xl font-semibold">Companies List</h1>
                    <p className="text-sm text-slate-500">Browse and find placement opportunities</p>
                </header>

                <Button
                    variant="outline"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`gap-2 ${filtersOpen ? 'bg-slate-100' : ''}`}
                >
                    <Filter className="size-4" />
                    Filters
                    {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                </Button>
            </div>

            <div className="relative w-[250px] max-w-md">
                <Search className="absolute text-muted-foreground -translate-y-1/2 left-3 top-1/2 size-4" />
                <Input
                    placeholder="Search company or district..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="h-9 w-[250px] pl-8 bg-muted border-none"
                />
                {/*}
                {isSearching && (
                    <LoaderCircleIcon className="absolute text-muted-foreground right-3 top-1/2 size-4 animate-spin" />
                )}
                */}
            </div>

            {filtersOpen && (
                <div className="w-full p-5 border border-gray-200 bg-gray-50 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Refine Search</h2>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700">
                                <RotateCcw className="size-3" /> Reset
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-gray-800">District</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {districtOptions.map(district => (
                                    <label key={district} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedDistricts.includes(district)}
                                            onChange={() => toggleSelection(district, selectedDistricts, setSelectedDistricts)}
                                            className="text-blue-600 border-gray-300 rounded focus-visible:ring-primary/25"
                                        />
                                        {district}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-gray-800">Availability</h3>
                            <div className="flex gap-4">
                                {statusOptions.map(status => (
                                    <label key={status} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() => toggleSelection(status, selectedStatuses, setSelectedStatuses)}
                                            className="text-blue-600 border-gray-300 rounded focus-visible:ring-primary/25"
                                        />
                                        {status}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 w-full overflow-hidden bg-white">
                {!hasAssignedIntake ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                        An internship term is not available for your assigned intake yet. Ask the Admin to check your intake and the semester list before you apply.
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredCompanies} />
                )}
            </div>
        </div>
    );
}

Companies.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
