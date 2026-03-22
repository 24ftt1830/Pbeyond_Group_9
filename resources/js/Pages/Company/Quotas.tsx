import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function ManageUsers() { 
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            <header className="w-full">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quotas</h1>
            </header>
        </div>
    );
}

ManageUsers.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;