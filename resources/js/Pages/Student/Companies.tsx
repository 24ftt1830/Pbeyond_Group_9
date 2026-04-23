import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Search, Filter, X, Eye, LoaderCircleIcon, RotateCcw } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Input } from '@/Components/ui/input';

// --- Types ---
interface Company {
    company_id: number;
    company_name: string;
    industry_sector: string;
    office_address: string;
    available: number;
}

interface Props {
    companies: Company[];
}

const districtOptions = ['Brunei Muara', 'Tutong', 'Temburong', 'Belait'];
const statusOptions = ['Available', 'Full'];

export default function Companies({ companies = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

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
                    selectedDistricts.includes(company.office_address);

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
        <div className="w-full px-4 py-10 mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
            <Head title="Available Companies" />

            <div className="flex items-center justify-between w-full">
                <header>
                    <h1 className="text-3xl font-extrabold text-slate-900">Companies List</h1>
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

            <div className="relative w-full max-w-md">
                <Search className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 size-4" />
                <Input
                    placeholder="Search company or district..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-9"
                />
                {isSearching && (
                    <LoaderCircleIcon className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 size-4 animate-spin" />
                )}
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
                            <h3 className="mb-2 text-sm font-bold text-gray-800">District</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {districtOptions.map(district => (
                                    <label key={district} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedDistricts.includes(district)}
                                            onChange={() => toggleSelection(district, selectedDistricts, setSelectedDistricts)}
                                            className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        {district}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-bold text-gray-800">Availability</h3>
                            <div className="flex gap-4">
                                {statusOptions.map(status => (
                                    <label key={status} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() => toggleSelection(status, selectedStatuses, setSelectedStatuses)}
                                            className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        {status}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full overflow-hidden bg-white border border-gray-200 shadow-sm rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Company Name</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Sector</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">District</th>
                            <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company) => (
                                <tr key={company.company_id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{company.company_name}</div>
                                        <div className="text-xs">
                                            {company.calculatedStatus === 'Full' ? (
                                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                                    Full
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Available
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {company.industry_sector}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {company.office_address}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                                        <Link
                                            href={route('student.companies.view', company.company_id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-semibold"
                                        >
                                            <Eye className="size-4" /> View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-16 text-center">
                                    <p className="text-sm text-gray-400">No companies found matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Companies.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;