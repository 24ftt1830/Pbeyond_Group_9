import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import UserTable from '@/Components/user-tabs';

export default function ManageUsers() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <UserTable />
        </>
    );
}

ManageUsers.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
