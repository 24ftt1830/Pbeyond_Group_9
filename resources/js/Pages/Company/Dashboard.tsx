import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sato text-3xl font-bold">Overview</h1>
        </div>
        </div>


    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;