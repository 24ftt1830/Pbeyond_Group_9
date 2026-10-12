import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { RecordFeedback } from '@/Components/Admin/RecordControls';
import SupervisorAccounts, { type SupervisorAccountsProps } from '@/Components/Admin/SupervisorAccounts';

export default function Supervisors(props: SupervisorAccountsProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Supervisor Accounts" />
            <RecordFeedback />
            <main className="space-y-6 p-6">
                <BackButton href={route('admin.manage-users')}>Back to Manage Users</BackButton>
                <SupervisorAccounts {...props} />
            </main>
        </AuthenticatedLayout>
    );
}
