import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'
import { ScrollAreaHorizontalDemo } from '@/Components/Dashboard/company-onboarding';
// import { DataTable } from '@/Components/ui/data-table';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface Quota {
  quota_id: number;
  position_title: string;
  remaining_spots: number;
  min_cgpa: number;
  available: number;
  is_full: boolean;
  company: {
    company_name: string;
    office_address: string;
  };
}

interface Props {
  availableQuotas: Quota[];
}

export default function Dashboard({ availableQuotas }: Props) {
  console.log(availableQuotas)
  const { auth } = usePage<PageProps>().props;


  const columns = useMemo<ColumnDef<Quota>[]>(() => [
    {
      accessorKey: 'position_title',
      header: 'Position',
      cell: ({ row }) => <span>{row.original.position_title}</span>
    },
    {
      accessorKey: 'company.company_name',
      header: 'Company',
    },
    {
      accessorKey: 'company.office_address',
      header: 'District',
    },
    {
      accessorKey: 'available',
      header: 'Available Slots',
      cell: ({ row }) => {
        const isFull = row.original.is_full;
        const available = row.original.available;

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {isFull ? 'Full' : `${available} Available`}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <Link href={route('student.companies.view', row.original.quota_id)}>
          <Button variant="outline" size="sm" className="shadow-none">View</Button>
        </Link>
      ),
    },
  ], []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-sato text-3xl font-bold">Overview</h1>
      </div>
      <h3 className="font-semibold">
        Let's get you ready to bridge the gap. <span className="text-foreground text-sm">(1 of 6)</span>
      </h3>
      <p className="text-sm">
        There are a few more steps required before you can start connecting with students.
      </p>

      <div>
        <ScrollAreaHorizontalDemo />
      </div>

      <div>

      </div>

      {/*
            <div className="mt-4">
                <h1 className="text-xl font-bold font-sato mb-6">All quotas</h1>

                <div className="rounded-xl bg-white overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={availableQuotas}
                    />
                </div>
            </div>
            */}
    </div>
  );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;