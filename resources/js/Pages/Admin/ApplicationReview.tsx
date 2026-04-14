import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ApplicationReview() {
    const { applications } = usePage().props;

    const handleApprove = (id) => {
        if (confirm('Approve this application? It will be sent to the company.')) {
            router.post(route('admin.applications.approve', id));
        }
    };

    const handleReject = (id) => {
        if (confirm('Reject this application? The student will be notified.')) {
            router.post(route('admin.applications.reject', id));
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Student Applications</h1>
            {applications.length === 0 ? (
                <p className="text-gray-500">No pending applications.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((app) => (
                                <tr key={app.application_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.student?.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.student?.programme?.programme_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.student?.cgpa}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.quota?.company?.company_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.quota?.job_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.apply_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(app.application_id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(app.application_id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Reject
                                            </button>
                                        </div>
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

ApplicationReview.layout = (page) => <AuthenticatedLayout children={page} />;
