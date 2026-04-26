import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'
import { ScrollAreaHorizontalDemo } from '@/Components/Dashboard/student-onboarding';

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-3">
                <h1 className="font-sato text-3xl font-bold">Overview</h1>
            </div>
            <h3 className="font-semibold">
                Let's get you ready to bridge the gap. <span className="text-foreground text-sm">(1 of 6)</span>
            </h3>
            <p className="text-sm">
                There are a few more steps required before you can start collaborating with industry partners.
            </p>

            <div>
                <ScrollAreaHorizontalDemo />
            </div>
        </div>
            
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;