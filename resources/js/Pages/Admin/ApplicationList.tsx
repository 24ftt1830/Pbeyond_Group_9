import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage, Head } from '@inertiajs/react';
import { useMemo, type ReactNode } from 'react';
import { DataTable } from '@/Components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/Components/ui/badge';

interface Application {
    application_id: number;
    created_at: string;
    app_status: string;
    student: {
        full_name: string;
        programme: {
            programme_name: string;
        };
    };
    quota: {
        job_title: string;
        company: {
            company_name: string;
        };
    };
}

interface PageProps {
    applications: Application[];
    [key: string]: unknown;
}

export default function ApplicationList() {
    const { applications } = usePage<PageProps>().props;

    const columns = useMemo<ColumnDef<Application>[]>(() => [
        {
            accessorKey: 'student.full_name',
            header: 'Student',
            cell: ({ row }) => <span className="text-zinc-900">{row.original.student?.full_name}</span>
        },
        {
            accessorKey: 'student.programme.programme_name',
            header: 'Programme',
            cell: ({ row }) => <span className="text-zinc-900">{row.original.student?.programme?.programme_name}</span>
        },
        {
            accessorKey: 'quota.company.company_name',
            header: 'Company',
            cell: ({ row }) => <span className="text-zinc-900">{row.original.quota?.company?.company_name}</span>
        },
        {
            accessorKey: 'quota.job_title',
            header: 'Quota',
            cell: ({ row }) => <span className="text-zinc-900">{row.original.quota?.job_title}</span>
        },
        {
            accessorKey: 'created_at',
            header: 'Applied On',
            cell: ({ row }) => (
                <span className="text-zinc-900">
                    {new Date(row.original.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                    })}
                </span>
            )
        },
        {
            accessorKey: 'app_status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.app_status || 'Pending';
                
                const variants: Record<string, string> = {
                    Recruited: 'border-emerald-200 bg-emerald-50/30 text-emerald-700',
                    Waitlisted: 'border-amber-200 bg-amber-50/30 text-amber-700',
                    Declined: 'border-rose-200 bg-rose-50/30 text-rose-700',
                    Pending: 'border-zinc-200 bg-zinc-50/30 text-zinc-700',
                };

                return (
                    <Badge 
                        variant="outline" 
                        className={`text-[10px] uppercase tracking-tighter font-semibold ${variants[status] || variants.Pending}`}
                    >
                        {status}
                    </Badge>
                );
            }
        },
    ], []);

    return (
        <>
            <Head title="Student Applications" />
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-sato text-3xl font-bold">Student Applications</h1>
                </div>

                <div className="rounded-xl bg-white overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={applications}
                    />
                </div>
            </div>
        </>
    );
}

ApplicationList.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;