import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { MoreHorizontal, MoreVertical, Eye, MessageCircle, Clock, Check } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { DataTable } from "@/Components/ui/data-table";
import { getColumns } from '@/Components/Applications/columns';
import { Button } from '@/Components/ui/button';
import { AnimatedTabsList } from '@/Components/ui/animated-tabs';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/Components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/Components/ui/dropdown-menu';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";


const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
};


const DetailItem = ({
    label,
    value
}: {
    label: string,
    value: string | null | undefined
}) => (
    <div>
        <p className="text-muted-foreground font-medium text-xs mb-2">
            {label}
        </p>
        <p className="font-normal">
            {value || 'N/A'}
        </p>
    </div>
);


export default function Show({
    quota,
    applications
}: {
    quota: any,
    applications: any[]
}) {
    const [activeTab, setActiveTab] = useState("all");
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

    const isPending =
        !selectedApplication?.app_status ||
        selectedApplication?.app_status?.toLowerCase() === 'pending';

    const filteredApplications = useMemo(() => {
        if (activeTab === "all") return applications;

        return applications.filter((app) =>
            (app.app_status || 'pending').toLowerCase() === activeTab
        );
    }, [activeTab, applications]);

    const updateStatus = (
        quotaId: number,
        applicationId: number,
        status: string
    ) => {
        router.put(
            route('company.applications.update-status', {
                quota: quotaId,
                application: applicationId
            }),
            { status: status },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const closeQuota = () => {
        router.post(
            route('company.quotas.close', quota.quota_id),
            {},
            {
                onSuccess: () => {
                    toast.success('Application submitted successfully!');
                }
            }
        );
    };

    const columns = getColumns(
        updateStatus,
        setSelectedApplication
    );

    const currentIndex = selectedApplication
        ? applications.findIndex(
            a => a.id === selectedApplication.id
        ) + 1
        : 0;

    return (
        <>
            <Head title={`Applicants - ${quota.job_title}`} />

            <div className="p-6">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={route('company.applications')}>
                                    Applications
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator />

                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                {quota.job_title}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-sato text-3xl font-bold">
                        {quota.job_title}
                    </h1>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="shadow-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                disabled={quota.status === 'Closed'}
                            >
                                {quota.status === 'Closed'
                                    ? 'Application Closed'
                                    : 'Close application'}
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                    This will stop students from applying to this
                                    position. Any remaining pending applications
                                    will be marked as "Declined".
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    onClick={closeQuota}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Close Position
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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

                <DataTable
                    columns={columns}
                    data={filteredApplications}
                />
            </div>

            <Sheet
                open={!!selectedApplication}
                onOpenChange={() => setSelectedApplication(null)}
            >
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader className="flex flex-row items-center justify-between">
                        <SheetTitle className="text-xs text-muted-foreground font-normal">
                            {currentIndex} out of {applications.length} candidates
                        </SheetTitle>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-transparent text-muted-foreground pr-7"
                                >
                                    <MoreVertical />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                {[
                                    'Waitlisted',
                                    'Recruited',
                                    'Declined'
                                ].map((status) => (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={() =>
                                            updateStatus(
                                                selectedApplication?.quota_id,
                                                selectedApplication?.id,
                                                status
                                            )
                                        }
                                    >
                                        Mark as {status}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SheetHeader>

                    {selectedApplication && (
                        <div className="mt-4 space-y-6">

                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                                    {selectedApplication.student.user_image ? (
                                        <img
                                            src={selectedApplication.student.user_image}
                                            className="rounded-full w-full h-full object-cover"
                                        />
                                    ) : (
                                        getInitials(
                                            selectedApplication.student.full_name
                                        )
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-xl font-sato font-bold">
                                        {selectedApplication.student.full_name}
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        {selectedApplication.student.user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-2">
                                        Stage
                                    </p>

                                    <p className="text-sm font-normal">
                                        Application review
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-2">
                                        State
                                    </p>

                                    <p className="text-sm font-normal flex items-center gap-1">
                                        {isPending ? (
                                            <>
                                                <Clock className="h-4 w-4" />
                                                Pending
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Completed
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm">
                                    Academic Details
                                </h3>

                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <DetailItem
                                        label="Student ID"
                                        value={selectedApplication.student.pb_student_code}
                                    />

                                    <DetailItem
                                        label="Email"
                                        value={selectedApplication.student.user?.email}
                                    />

                                    <DetailItem
                                        label="Phone"
                                        value={selectedApplication.student.phone}
                                    />

                                    <DetailItem
                                        label="CGPA"
                                        value={selectedApplication.student.cgpa}
                                    />

                                    <DetailItem
                                        label="Programme"
                                        value={selectedApplication.student.programme?.programme_name}
                                    />
                                </div>

                                {/* CV */}
                                {selectedApplication.student.cv_file_path && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            window.open(
                                                selectedApplication.student.cv_file_path,
                                                '_blank'
                                            )
                                        }
                                    >
                                        View CV Attachment
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-sm">
                                    Activity
                                </h3>

                                <div className="relative border-l ml-2 pl-6 space-y-6">

                                    <div className="relative before:absolute before:-left-[29px] before:top-1 before:h-3 before:w-3 before:rounded-full before:bg-primary">
                                        <p className="text-sm font-medium">
                                            Application submitted
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {new Date(
                                                selectedApplication.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="relative before:absolute before:-left-[29px] before:top-1 before:h-3 before:w-3 before:rounded-full before:bg-muted-foreground">
                                        <p className="text-sm font-medium">
                                            Application review stage
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {new Date(
                                                selectedApplication.updated_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);