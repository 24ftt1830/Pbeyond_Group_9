import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Interviews() {
return (
        <div className="w-full px-4 py-10 mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">
            <Head title="Interviews" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <header>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Interviews</h1>
                </header>
            </div>
        </div>
    )
}

Interviews.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />