import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { ReactNode } from 'react';

export default function Favourites() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Favourites</h1>
            <div className="mt-4 max-w-sm">
                <label htmlFor="favourites-search" className="block text-sm font-medium">
                    Looking for a specific company?
                </label>
                <input
                    id="favourites-search"
                    type="text"
                    placeholder="Search company"
                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                />
            </div>
            <div className="mt-6 overflow-x-auto">
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
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="px-4 py-3 text-sm text-muted-foreground" colSpan={7}>
                                No favourites available.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Favourites.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
