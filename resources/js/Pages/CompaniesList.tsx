import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

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

export default function CompaniesList({ companies = [] }: { companies?: Company[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
    const [selectedInterviewRequired, setSelectedInterviewRequired] = useState<string[]>([]);

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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Companies List</h1>
            <div className="mt-4 max-w-sm">
                <label htmlFor="company-search" className="block text-sm font-medium">
                    Looking for a specific company?
                </label>
                <input
                    id="company-search"
                    type="text"
                    placeholder="Search company"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left text-sm font-semibold">ID Number</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Company Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Quota Availability</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Interview Required</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">School</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">District</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.length > 0 ? (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="border-b">
                                        <td className="px-4 py-3 text-sm">{company.id}</td>
                                        <td className="px-4 py-3 text-sm">{company.name}</td>
                                        <td className="px-4 py-3 text-sm">{company.status}</td>
                                        <td className="px-4 py-3 text-sm">{company.quota_availability}</td>
                                        <td className="px-4 py-3 text-sm">{company.interview_required}</td>
                                        <td className="px-4 py-3 text-sm">{company.school}</td>
                                        <td className="px-4 py-3 text-sm">{company.district}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <Link
                                                href={route('student.companies.view', company.id)}
                                                className="rounded-md bg-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/20"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b">
                                    <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={8}>
                                        No companies available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <aside className="h-fit rounded-xl border border-black/10 bg-white p-4 shadow">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Filter</h2>

                    <div className="space-y-5 text-sm">
                        <div>
                            <p className="mb-2 font-semibold">District</p>
                            <div className="space-y-2">
                                {districtOptions.map((district) => (
                                    <label key={district} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedDistricts.includes(district)}
                                            onChange={() =>
                                                toggleSelection(district, selectedDistricts, setSelectedDistricts)
                                            }
                                        />
                                        <span>{district}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 font-semibold">Status</p>
                            <div className="space-y-2">
                                {statusOptions.map((status) => (
                                    <label key={status} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() =>
                                                toggleSelection(status, selectedStatuses, setSelectedStatuses)
                                            }
                                        />
                                        <span>{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 font-semibold">School</p>
                            <div className="space-y-2">
                                {schoolOptions.map((school) => (
                                    <label key={school} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedSchools.includes(school)}
                                            onChange={() =>
                                                toggleSelection(school, selectedSchools, setSelectedSchools)
                                            }
                                        />
                                        <span>{school}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 font-semibold">Interview Required?</p>
                            <div className="space-y-2">
                                {interviewOptions.map((interview) => (
                                    <label key={interview} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedInterviewRequired.includes(interview)}
                                            onChange={() =>
                                                toggleSelection(
                                                    interview,
                                                    selectedInterviewRequired,
                                                    setSelectedInterviewRequired,
                                                )
                                            }
                                        />
                                        <span>{interview}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

CompaniesList.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
