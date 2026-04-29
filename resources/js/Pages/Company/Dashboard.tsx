import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'
import { ScrollAreaHorizontalDemo } from '@/Components/Dashboard/company-onboarding';
import { DataTable } from '@/Components/ui/data-table';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Users, FileText, Clock, Target } from "lucide-react";

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

interface Stats {
  total_applications: number;
  new_applications: number;
  pending_reviews: number;
  recruitment_status: { recruited: number, total: number };
}

interface Application {
  id: number;
  created_at: string;
  student: {
    user: { name: string };
  };
  quota: {
    job_title: string;
  };
}

interface Props {
  availableQuotas: Quota[];
  applications: Application[];
  stats: Stats;
}

export default function Dashboard({ availableQuotas, applications, stats }: Props) {
  const safeStats = stats ?? {
    total_applications: 0,
    new_applications: 0,
    pending_reviews: 0,
    recruitment_status: { recruited: 0, total: 0 }
  };
  const { auth } = usePage<PageProps>().props;

  const applicationColumns = useMemo<ColumnDef<Application>[]>(() => [
    {
      accessorKey: 'student.full_name',
      header: 'Student Name',
    },
    {
      accessorKey: 'quota.job_title',
      header: 'Job Title',
      cell: ({ row }) => row.original.quota?.job_title || 'N/A'
    },
    {
      accessorKey: 'created_at',
      header: 'Applied At',
      cell: ({ row }) => {
        return new Date(row.original.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={route('company.applications.view', row.original.id)}>
          <Button className="shadow-none" variant="outline" size="sm">Review</Button>
        </Link>
      ),
    },
  ], []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.total_applications}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.new_applications}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.pending_reviews}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recruitment Status</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeStats.recruitment_status.recruited} / {safeStats.recruitment_status.total}
            </div>
            <p className="text-xs text-muted-foreground">Students recruited</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <h1 className="text-xl font-bold font-sato mb-6">Recent applications</h1>
        <div className="rounded-xl bg-white overflow-hidden">
          <DataTable
            columns={applicationColumns}
            data={applications}
          />
        </div>
      </div>
    </div>
  );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;