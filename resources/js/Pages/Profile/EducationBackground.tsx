import AccountSectionLayout from './Partials/AccountSectionLayout';
import { Link } from '@inertiajs/react';

interface EducationEntry {
    id: number;
    level: string;
    institution: string;
    durationStart: string;
    durationEnd: string;
    gradeResult: string;
}

export default function EducationBackground({ educationEntries = [] }: { educationEntries?: EducationEntry[] }) {
    return (
        <AccountSectionLayout title="Education Background">
            <div className="mb-4 flex justify-end">
                <Link
                    href={route('profile.education-background-add')}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
                >
                    Add
                </Link>
            </div>
            <div className="mx-auto max-w-4xl rounded-xl border border-black/10 bg-white p-6 shadow">
                <h3 className="mb-4 font-semibold text-black">Education History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-black/10 bg-black/5">
                                <th className="px-4 py-3 font-semibold text-black">Level</th>
                                <th className="px-4 py-3 font-semibold text-black">Institution</th>
                                <th className="px-4 py-3 font-semibold text-black">Duration</th>
                                <th className="px-4 py-3 font-semibold text-black">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {educationEntries.length > 0 ? (
                                educationEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b border-black/10 hover:bg-black/2">
                                        <td className="px-4 py-3 text-black">{entry.level}</td>
                                        <td className="px-4 py-3 text-black">{entry.institution}</td>
                                        <td className="px-4 py-3 text-black">
                                            {entry.durationStart} - {entry.durationEnd}
                                        </td>
                                        <td className="px-4 py-3 text-black">{entry.gradeResult}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-center text-black/70">
                                        No education background records yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AccountSectionLayout>
    );
}
