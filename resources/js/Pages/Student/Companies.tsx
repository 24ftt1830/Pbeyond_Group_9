import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Search, Filter, X, Eye } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";

type Company = {
    id: number;
    name: string;
    status: string;
    quota_availability: number;
    interview_required: string;
    school: string;
    district: string;
};

const districtOptions = ['Brunei-Muara', 'Tutong', 'Temburong', 'Kuala Belait'];
const statusOptions = ['Available', 'Full'];
const schoolOptions = ['SICT', 'SBS', 'SHS', 'SSE', 'SPE'];
const interviewOptions = ['Yes', 'No', 'Depending on the course'];

export default function Companies({ companies = [] }: { companies?: Company[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
    const [selectedInterviewRequired, setSelectedInterviewRequired] = useState<string[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const toggleSelection = (value: string, selected: string[], setSelected: (val: string[]) => void) => {
        if (selected.includes(value)) {
            setSelected(selected.filter(item => item !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            const matchesSearch = !searchQuery || company.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(company.district);
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(company.status);
            const matchesSchool = selectedSchools.length === 0 || selectedSchools.includes(company.school);
            const matchesInterview = selectedInterviewRequired.length === 0 || selectedInterviewRequired.includes(company.interview_required);
            return matchesSearch && matchesDistrict && matchesStatus && matchesSchool && matchesInterview;
        });
    }, [companies, searchQuery, selectedDistricts, selectedStatuses, selectedSchools, selectedInterviewRequired]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedDistricts([]);
        setSelectedStatuses([]);
        setSelectedSchools([]);
        setSelectedInterviewRequired([]);
    };

    const hasActiveFilters = selectedDistricts.length > 0 || selectedStatuses.length > 0 || selectedSchools.length > 0 || selectedInterviewRequired.length > 0;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Companies List</h1>
                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Filters</span>
                    {hasActiveFilters && <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">●</span>}
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Filter Panel */}
            {filtersOpen && (
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-semibold text-gray-700">Filter companies</h2>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                <X className="h-3 w-3" /> Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">District</h3>
                            <div className="space-y-1.5">
                                {districtOptions.map(district => (
                                    <label key={district} className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={selectedDistricts.includes(district)}
                                            onChange={() => toggleSelection(district, selectedDistricts, setSelectedDistricts)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{district}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                            <div className="space-y-1.5">
                                {statusOptions.map(status => (
                                    <label key={status} className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() => toggleSelection(status, selectedStatuses, setSelectedStatuses)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">School</h3>
                            <div className="space-y-1.5">
                                {schoolOptions.map(school => (
                                    <label key={school} className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={selectedSchools.includes(school)}
                                            onChange={() => toggleSelection(school, selectedSchools, setSelectedSchools)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{school}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Interview Required?</h3>
                            <div className="space-y-1.5">
                                {interviewOptions.map(opt => (
                                    <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={selectedInterviewRequired.includes(opt)}
                                            onChange={() => toggleSelection(opt, selectedInterviewRequired, setSelectedInterviewRequired)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Companies Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota Availability</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Required</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            company.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.quota_availability}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.interview_required}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.school}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.district}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Link
                                            href={route('student.companies.view', company.id)}
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            <Eye className="w-4 h-4" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No companies match your filters.
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
