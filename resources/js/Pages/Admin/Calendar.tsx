import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CalendarComponent from '@/Components/Calendar'; 
import { Head } from '@inertiajs/react';

interface PageProps {
    auth: any;
    events: any[]; 
}

export default function CalendarPage({ events }: PageProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Events" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <CalendarComponent events={events} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}