import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Interns() {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-sato text-3xl font-bold">Interns</h1>
            </div>
        </div>
    )
}

Interns.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />