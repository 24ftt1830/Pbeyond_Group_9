import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function AdminProfile({ auth }: PageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-zinc-800 leading-tight">Admin Profile</h2>}
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Admin Account Details</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your administrative account settings here.
                        </p>
                        {/* Add your profile form/content here */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}