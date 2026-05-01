import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, usePage } from '@inertiajs/react';

export default function Reports() {
    const { reports = [] } = usePage().props;


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Student Reports (Grievances)</h1>
        </div>
    );
}

Reports.layout = (page:React.ReactNode) => <AuthenticatedLayout children={page} />;
