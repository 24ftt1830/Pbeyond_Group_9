import AccountSectionLayout from './Partials/AccountSectionLayout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ProfileInfo() {
    const { auth } = usePage<PageProps>().props;
    const [birthplaceQuery, setBirthplaceQuery] = useState('');
    const [showBirthplaceOptions, setShowBirthplaceOptions] = useState(false);
    const birthplaceContainerRef = useRef<HTMLDivElement>(null);

    const countries = [
        'Malaysia',
        'Singapore',
        'Indonesia',
        'Thailand',
        'Brunei',
        'Vietnam',
        'Philippines',
        'Cambodia',
        'Laos',
        'Myanmar',
        'China',
        'Japan',
        'South Korea',
        'India',
        'Pakistan',
        'Bangladesh',
        'Sri Lanka',
        'Nepal',
        'Australia',
        'New Zealand',
        'United Kingdom',
        'Ireland',
        'United States',
        'Canada',
        'Mexico',
        'Brazil',
        'Argentina',
        'Germany',
        'France',
        'Italy',
        'Spain',
        'Netherlands',
        'Sweden',
        'Norway',
        'Denmark',
        'Switzerland',
        'Turkey',
        'United Arab Emirates',
        'Saudi Arabia',
        'South Africa',
    ];

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                birthplaceContainerRef.current &&
                !birthplaceContainerRef.current.contains(event.target as Node)
            ) {
                setShowBirthplaceOptions(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const filteredCountries = useMemo(() => {
        const keyword = birthplaceQuery.trim().toLowerCase();
        if (!keyword) {
            return countries;
        }

        return countries.filter((country) => country.toLowerCase().includes(keyword));
    }, [birthplaceQuery]);

    const studentProfile = {
        name: auth.user.name,
        email: auth.user.email,
        studentId: 'S12345678',
        intakeNumber: 'INTAKE-2026-01',
        programme: 'Diploma in Information Technology',
        cgpa: '3.72',
        workExperience: 'Interned as Junior Web Developer at BrightTech Solutions (3 months)',
    };

    return (
        <AccountSectionLayout title="Profile Info">
            <div className="mb-4 flex justify-end gap-3">
                <button className="rounded-md bg-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/20">
                    Cancel
                </button>
                <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">
                    Update
                </button>
            </div>
            <div className="mx-auto max-w-4xl rounded-xl border border-black/10 bg-white p-6 shadow">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/10 text-xl font-semibold text-black">
                            {studentProfile.name
                                .split(' ')
                                .map((word) => word[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-black">{studentProfile.name}</h2>
                            <p className="text-sm text-black/70">Student ID: {studentProfile.studentId}</p>
                            <p className="text-sm text-black/70">Student Email: {studentProfile.email}</p>
                        </div>
                    </div>

                    <div className="rounded-md bg-black/5 px-3 py-2 text-sm text-black">
                        <span className="font-semibold">Intake Number:</span> {studentProfile.intakeNumber}
                    </div>
                </div>

                <div className="my-6 h-px w-full bg-black/15" />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-black/10 p-4">
                        <h3 className="mb-4 font-semibold text-black">Personal Details</h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="ic-number" className="text-sm font-medium text-black">
                                    IC Number
                                </label>
                                <input
                                    id="ic-number"
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="ic-colour" className="text-sm font-medium text-black">
                                    IC Colour
                                </label>
                                <select
                                    id="ic-colour"
                                    defaultValue=""
                                    className="mt-1 w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="" disabled>
                                        Select IC colour
                                    </option>
                                    <option value="yellow">Yellow</option>
                                    <option value="red">Red</option>
                                    <option value="purple">Purple</option>
                                    <option value="green">Green</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <label htmlFor="gender" className="text-sm font-medium text-black">
                                Gender:
                            </label>
                            <select
                                id="gender"
                                defaultValue=""
                                className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm"
                            >
                                <option value="" disabled>
                                    Select gender
                                </option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label htmlFor="religion" className="text-sm font-medium text-black">
                                Religion
                            </label>
                            <input
                                id="religion"
                                type="text"
                                className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="nationality" className="text-sm font-medium text-black">
                                Nationality
                            </label>
                            <input
                                id="nationality"
                                type="text"
                                className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <label htmlFor="date-of-birth" className="text-sm font-medium text-black">
                                Date of Birth:
                            </label>
                            <input
                                id="date-of-birth"
                                type="date"
                                className="w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="mt-4" ref={birthplaceContainerRef}>
                            <label htmlFor="birthplace" className="text-sm font-medium text-black">
                                Birthplace
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="birthplace"
                                    type="text"
                                    value={birthplaceQuery}
                                    onFocus={() => setShowBirthplaceOptions(true)}
                                    onChange={(event) => {
                                        setBirthplaceQuery(event.target.value);
                                        setShowBirthplaceOptions(true);
                                    }}
                                    autoComplete="off"
                                    placeholder="Type or select a country"
                                    className="w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                                />

                                {showBirthplaceOptions && (
                                    <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-black/15 bg-white shadow">
                                        {filteredCountries.length > 0 ? (
                                            filteredCountries.map((country) => (
                                                <button
                                                    key={country}
                                                    type="button"
                                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5"
                                                    onClick={() => {
                                                        setBirthplaceQuery(country);
                                                        setShowBirthplaceOptions(false);
                                                    }}
                                                >
                                                    {country}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="px-3 py-2 text-sm text-black/60">No matching country</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-md border border-black/10 p-4">
                        <h3 className="mb-4 font-semibold text-black">Academic and Work</h3>

                        <div>
                            <p className="text-sm font-medium text-black">Programme</p>
                            <p className="mt-1 text-sm text-black/80">{studentProfile.programme}</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-black">CGPA</p>
                            <p className="mt-1 text-sm text-black/80">{studentProfile.cgpa}</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-black">Work Experience</p>
                            <p className="mt-1 text-sm text-black/80">{studentProfile.workExperience}</p>
                        </div>
                    </div>
                </div>

                <div className="my-6 h-px w-full bg-black/15" />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-black/10 p-4">
                        <h3 className="mb-4 font-semibold text-black">Contact and Emergencies</h3>

                        <div>
                            <p className="text-sm font-medium text-black">Mobile Number</p>
                            <p className="mt-1 text-sm text-black/80">+673123456</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-black">Emergency Contact</p>
                            <p className="mt-1 text-sm text-black/80">+673123456</p>
                        </div>
                    </div>
                    <div className="rounded-md border border-black/10 p-4">
                        <h3 className="mb-4 font-semibold text-black">Address</h3>

                        <div>
                            <p className="text-sm font-medium text-black">Street Address</p>
                            <p className="mt-1 text-sm text-black/80">123 Jalan Merdeka, Block A</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-black">City</p>
                            <p className="mt-1 text-sm text-black/80">Bandar Seri Begawan</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-black">State/Province</p>
                            <p className="mt-1 text-sm text-black/80">Brunei-Muara</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-black">Postal Code</p>
                            <p className="mt-1 text-sm text-black/80">BE1115</p>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-black">Country</p>
                            <p className="mt-1 text-sm text-black/80">Brunei Darussalam</p>
                        </div>
                    </div>
                </div>
            </div>
        </AccountSectionLayout>
    );
}
