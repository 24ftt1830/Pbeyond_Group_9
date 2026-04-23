import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Applicants() {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-sato text-3xl font-bold">Applications</h1>
            </div>
        </div>
    )
}

Applicants.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />