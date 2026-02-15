import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                Box 1
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                Box 2
            </div>
            <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                Box 3
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;