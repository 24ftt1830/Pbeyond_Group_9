import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RecordFeedback } from '@/Components/Admin/RecordControls';
import UserTable from '@/Components/user-tabs';

export default function ManageUsers() {
    return (
        <>
            <RecordFeedback />
            <UserTable />
        </>
    );
}

ManageUsers.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
