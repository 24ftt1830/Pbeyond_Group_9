import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Profile() {
    return (
        <>
            <Head title="Profile" />
            
            <div className="p-6">
                <h1 className="font-sato text-3xl font-bold mb-6">Profile</h1>
                    <p className="text-muted-foreground">to be added.</p>
            </div>
        </>
    );
}

Profile.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;