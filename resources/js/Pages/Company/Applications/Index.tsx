import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/Components/ui/data-table';
import { ChevronRight, LayoutGrid } from "lucide-react";
import { useMemo } from 'react';

// --- Types ---
interface Programme {
    programme_name: string;
}

interface Quota {
    quota_id: number;
    job_title: string;
    programme: Programme | null; 
    is_live: boolean;
    status: boolean;
    applications_count: number;
    slug: string;
}

export default function Applications({ quotas = [] }: { quotas: Quota[] }) {
    
    const columns = useMemo<ColumnDef<Quota>[]>(() => [
        {
            accessorKey: 'job_title',
            header: 'Job Title',
        },
        {
            id: 'programme_name',
            header: 'Programme',
            cell: ({ row }) => row.original.programme?.programme_name ?? '—',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_live ? "default" : "secondary"}>
                    {row.original.status ? "Live" : "Draft"}
                </Badge>
            ),
        },
        {
            accessorKey: 'applications_count',
            header: () => <div className="text-right">Applications</div>,
            cell: ({ row }) => <div className="text-center font-medium">{row.original.applications_count || 0}</div>,
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('company.applications.show', row.original.slug)}>
                            View <ChevronRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            ),
        },
    ], []);

    return (
        <>
            <Head title="Applications" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-sato text-3xl font-bold">Applications</h1>
                </div>

                {quotas.length > 0 ? (
                    <div className="rounded-xl bg-card">
                        <DataTable columns={columns} data={quotas} />
                    </div>
                ) : (
                    <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-slate-50/50">
                        <div className="p-3 bg-white rounded-full border mb-4 shadow-sm">
                            <LayoutGrid className="size-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No active applications</h3>
                        <p className="max-w-sm mt-1">There are currently no open recruitment cycles or applications to display.</p>
                    </div>
                )}
            </div>
        </>
    )
}

Applications.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />