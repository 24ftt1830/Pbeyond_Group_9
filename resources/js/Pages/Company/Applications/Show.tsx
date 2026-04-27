import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/Components/ui/sheet";
import { DataTable } from "@/Components/ui/data-table";
import { getColumns } from '@/Components/Applications/columns';
import { Button } from '@/Components/ui/button';
import { AnimatedTabsList } from '@/Components/ui/animated-tabs';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Link } from '@inertiajs/react';

export default function Show({ quota, applications }: { quota: any, applications: any[] }) {
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    const filteredApplications = useMemo(() => {
        if (activeTab === "all") return applications;

        return applications.filter((app) =>
            (app.app_status || 'pending').toLowerCase() === activeTab
        );
    }, [activeTab, applications]);

    const updateStatus = (applicationId: number, status: string) => {
        router.post(
            route('company.applications.update-status', {
                quota: quota.quota_id,
                application: applicationId
            }),
            {
                status: status
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const columns = getColumns(updateStatus, setSelectedStudent);

    return (
        <>
            <Head title={`Applicants - ${quota.job_title}`} />

            <div className="p-6">
                <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={route('company.applications')}>Applications</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{quota.job_title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="font-sato text-3xl font-bold">{quota.job_title}</h1>
                    </div>

                    <Button variant="outline" size="sm" className="shadow-sm">
                        Close application
                    </Button>
                </div>

                <div className="mb-6">
                    <AnimatedTabsList
                    groupId="student-applications"
                        activeValue={activeTab}
                        setActiveValue={setActiveTab}
                        tabs={[
                            { value: "all", label: "All applications" },
                            { value: "waitlisted", label: "Waitlisted" },
                            { value: "recruited", label: "Recruited" },
                            { value: "declined", label: "Declined" },
                        ]}
                    />
                </div>

                <DataTable columns={columns} data={filteredApplications} />
            </div>

            <Sheet open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Student Details</SheetTitle>
                        <SheetDescription>Comprehensive profile information.</SheetDescription>
                    </SheetHeader>
                    {selectedStudent && (
                        <div className="mt-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                <p className="text-base font-semibold">{selectedStudent.full_name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                <p className="text-base">{selectedStudent.email}</p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

Show.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;