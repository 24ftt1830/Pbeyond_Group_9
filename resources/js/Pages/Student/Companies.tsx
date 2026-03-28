// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Link } from '@inertiajs/react';
// import { useMemo, useState } from 'react';
// import type { ReactNode } from 'react';

// type Company = {
//     id: number;
//     name: string;
//     status: string;
//     quota_availability: number;
//     interview_required: string;
//     school: string;
//     district: string;
// };

// const districtOptions = ['Brunei-Muara', 'Tutong', 'Temburong', 'Kuala Belait'];
// const statusOptions = ['Available', 'Full'];
// const schoolOptions = ['SICT', 'SBS', 'SHS', 'SSE', 'SPE'];
// const interviewOptions = ['Yes', 'No', 'Depending on the course'];

// export default function CompaniesList({ companies = [] }: { companies?: Company[] }) {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
//     const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
//     const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
//     const [selectedInterviewRequired, setSelectedInterviewRequired] = useState<string[]>([]);

//     const toggleSelection = (value: string, selectedValues: string[], setSelectedValues: (values: string[]) => void) => {
//         if (selectedValues.includes(value)) {
//             setSelectedValues(selectedValues.filter((item) => item !== value));
//             return;
//         }

//         setSelectedValues([...selectedValues, value]);
//     };

//     const filteredCompanies = useMemo(() => {
//         const parseMultiValues = (value: string) =>
//             value
//                 .split(',')
//                 .map((item) => item.trim().toLowerCase())
//                 .filter(Boolean);

//         return companies.filter((company) => {
//             const normalizedSearch = searchQuery.trim().toLowerCase();
//             const matchesSearch = !normalizedSearch || company.name.toLowerCase().includes(normalizedSearch);

//             const companyDistricts = parseMultiValues(company.district);
//             const matchesDistrict =
//                 selectedDistricts.length === 0 ||
//                 selectedDistricts.some((district) => companyDistricts.includes(district.toLowerCase()));

//             const matchesStatus =
//                 selectedStatuses.length === 0 || selectedStatuses.includes(company.status.trim());

//             const companySchools = parseMultiValues(company.school);
//             const matchesSchool =
//                 selectedSchools.length === 0 ||
//                 selectedSchools.some((school) => companySchools.includes(school.toLowerCase()));

//             const matchesInterview =
//                 selectedInterviewRequired.length === 0 ||
//                 selectedInterviewRequired.includes(company.interview_required.trim());

//             return matchesSearch && matchesDistrict && matchesStatus && matchesSchool && matchesInterview;
//         });
//     }, [
//         companies,
//         searchQuery,
//         selectedDistricts,
//         selectedStatuses,
//         selectedSchools,
//         selectedInterviewRequired,
//     ]);

//     return (
//         <div className="p-6">
//             <h1 className="text-2xl font-bold">Companies List</h1>
//             <div className="mt-4 max-w-sm">
//                 <label htmlFor="company-search" className="block text-sm font-medium">
//                     Looking for a specific company?
//                 </label>
//                 <input
//                     id="company-search"
//                     type="text"
//                     placeholder="Search company"
//                     value={searchQuery}
//                     onChange={(event) => setSearchQuery(event.target.value)}
//                     className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
//                 />
//             </div>
//             <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full border-collapse">
//                         <thead>
//                             <tr className="border-b">
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">ID Number</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Company Name</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Quota Availability</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Interview Required</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">School</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">District</th>
//                                 <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filteredCompanies.length > 0 ? (
//                                 filteredCompanies.map((company) => (
//                                     <tr key={company.id} className="border-b">
//                                         <td className="px-4 py-3 text-sm">{company.id}</td>
//                                         <td className="px-4 py-3 text-sm">{company.name}</td>
//                                         <td className="px-4 py-3 text-sm">{company.status}</td>
//                                         <td className="px-4 py-3 text-sm">{company.quota_availability}</td>
//                                         <td className="px-4 py-3 text-sm">{company.interview_required}</td>
//                                         <td className="px-4 py-3 text-sm">{company.school}</td>
//                                         <td className="px-4 py-3 text-sm">{company.district}</td>
//                                         <td className="px-4 py-3 text-sm">
//                                             <Link
//                                                 href={route('student.companies.view', company.id)}
//                                                 className="rounded-md bg-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/20"
//                                             >
//                                                 View
//                                             </Link>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr className="border-b">
//                                     <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={8}>
//                                         No companies available.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 <aside className="h-fit rounded-xl border border-black/10 bg-white p-4 shadow">
//                     <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Filter</h2>

//                     <div className="space-y-5 text-sm">
//                         <div>
//                             <p className="mb-2 font-semibold">District</p>
//                             <div className="space-y-2">
//                                 {districtOptions.map((district) => (
//                                     <label key={district} className="flex items-center gap-2">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedDistricts.includes(district)}
//                                             onChange={() =>
//                                                 toggleSelection(district, selectedDistricts, setSelectedDistricts)
//                                             }
//                                         />
//                                         <span>{district}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         <div>
//                             <p className="mb-2 font-semibold">Status</p>
//                             <div className="space-y-2">
//                                 {statusOptions.map((status) => (
//                                     <label key={status} className="flex items-center gap-2">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedStatuses.includes(status)}
//                                             onChange={() =>
//                                                 toggleSelection(status, selectedStatuses, setSelectedStatuses)
//                                             }
//                                         />
//                                         <span>{status}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         <div>
//                             <p className="mb-2 font-semibold">School</p>
//                             <div className="space-y-2">
//                                 {schoolOptions.map((school) => (
//                                     <label key={school} className="flex items-center gap-2">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedSchools.includes(school)}
//                                             onChange={() =>
//                                                 toggleSelection(school, selectedSchools, setSelectedSchools)
//                                             }
//                                         />
//                                         <span>{school}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         <div>
//                             <p className="mb-2 font-semibold">Interview Required?</p>
//                             <div className="space-y-2">
//                                 {interviewOptions.map((interview) => (
//                                     <label key={interview} className="flex items-center gap-2">
//                                         <input
//                                             type="checkbox"
//                                             checked={selectedInterviewRequired.includes(interview)}
//                                             onChange={() =>
//                                                 toggleSelection(
//                                                     interview,
//                                                     selectedInterviewRequired,
//                                                     setSelectedInterviewRequired,
//                                                 )
//                                             }
//                                         />
//                                         <span>{interview}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </aside>
//             </div>
//         </div>
//     );
// }

// CompaniesList.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Search, Filter, X } from 'lucide-react';

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

    const toggleSelection = (value: string, selectedValues: string[], setSelectedValues: (values: string[]) => void) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter((item) => item !== value));
            return;
        }
        setSelectedValues([...selectedValues, value]);
    };

    const filteredCompanies = useMemo(() => {
        const parseMultiValues = (value: string) =>
            value
                .split(',')
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);

        return companies.filter((company) => {
            const normalizedSearch = searchQuery.trim().toLowerCase();
            const matchesSearch = !normalizedSearch || company.name.toLowerCase().includes(normalizedSearch);

            const companyDistricts = parseMultiValues(company.district);
            const matchesDistrict =
                selectedDistricts.length === 0 ||
                selectedDistricts.some((district) => companyDistricts.includes(district.toLowerCase()));

            const matchesStatus =
                selectedStatuses.length === 0 || selectedStatuses.includes(company.status.trim());

            const companySchools = parseMultiValues(company.school);
            const matchesSchool =
                selectedSchools.length === 0 ||
                selectedSchools.some((school) => companySchools.includes(school.toLowerCase()));

            const matchesInterview =
                selectedInterviewRequired.length === 0 ||
                selectedInterviewRequired.includes(company.interview_required.trim());

            return matchesSearch && matchesDistrict && matchesStatus && matchesSchool && matchesInterview;
        });
    }, [
        companies,
        searchQuery,
        selectedDistricts,
        selectedStatuses,
        selectedSchools,
        selectedInterviewRequired,
    ]);

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedDistricts([]);
        setSelectedStatuses([]);
        setSelectedSchools([]);
        setSelectedInterviewRequired([]);
    };

    const hasActiveFilters = selectedDistricts.length > 0 || selectedStatuses.length > 0 || selectedSchools.length > 0 || selectedInterviewRequired.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                                filtersOpen ? 'bg-gray-100 border-gray-300' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Filters</span>
                            {hasActiveFilters && <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">●</span>}
                        </button>
                    </div>
                </div>

                {/* Collapsible filter panel */}
                {filtersOpen && (
                    <div className="mb-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-semibold text-gray-700">Filter companies</h2>
                            {hasActiveFilters && (
                                <button onClick={clearAllFilters} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                    <X className="h-3 w-3" /> Clear all
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">District</h3>
                                <div className="space-y-1.5">
                                    {districtOptions.map((district) => (
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
                                    {statusOptions.map((status) => (
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
                                    {schoolOptions.map((school) => (
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
                                    {interviewOptions.map((opt) => (
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

                {/* Companies table – full width with horizontal scroll */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCompanies.length > 0 ? (
                                    filteredCompanies.map((company) => (
                                        <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        company.status === 'Available'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {company.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{company.quota_availability}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{company.interview_required}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{company.school}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{company.district}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={route('student.companies.view', company.id)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View
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
            </div>
        </div>
    );
}

Companies.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
