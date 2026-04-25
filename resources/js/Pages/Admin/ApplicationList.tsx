import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface Application {
    application_id: number;
    apply_date: string;
    app_status: string; 
    student: {
        full_name: string;
        programme: {
            programme_name: string;
        };
    };
    quota: {
        job_title: string;
        company: {
            company_name: string;
        };
    };
}

interface PageProps {
    applications: Application[];
    [key: string]: unknown;
}

export default function ApplicationList() {
    const { applications } = usePage<PageProps>().props;

    // Helper for status colors
    const getStatusStyles = (status: string) => {
        const styles: Record<string, string> = {
            Recruited: 'bg-green-100 text-green-800',
            Waitlisted: 'bg-yellow-100 text-yellow-800',
            Declined: 'bg-red-100 text-red-800',
            Pending: 'bg-gray-100 text-gray-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-sato text-3xl font-bold">Student Applications</h1>
            </div>

            {applications.length === 0 ? (
                <p className="text-gray-500">No applications found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((app) => (
                                <tr key={app.application_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.student?.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.student?.programme?.programme_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.quota?.company?.company_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.quota?.job_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(app.apply_date).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(app.app_status)}`}>
                                            {app.app_status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

ApplicationList.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;