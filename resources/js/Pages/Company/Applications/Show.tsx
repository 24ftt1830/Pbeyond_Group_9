import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { MoreVertical, Clock, Check, Calendar } from 'lucide-react';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/Components/ui/dialog";
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
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'ST';
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
    applications,
    requiresInterview
}: {
    quota: any,
    applications: any[],
    requiresInterview?: boolean
}) {
    const [activeTab, setActiveTab] = useState("all");
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
    const [interviewApp, setInterviewApp] = useState<any | null>(null);
    const [interviewDate, setInterviewDate] = useState("");

    const isInterviewRequired = Boolean(
        requiresInterview ||
        quota?.has_interview === 1 || quota?.has_interview === true || quota?.has_interview === "1" || quota?.has_interview === "Yes" ||
        quota?.requires_interview === 1 || quota?.requires_interview === true || quota?.requires_interview === "1" || quota?.requires_interview === "Yes" ||
        quota?.interview_required === 1 || quota?.interview_required === true || quota?.interview_required === "1" || quota?.interview_required === "Yes" ||
        quota?.is_interview_required === 1 || quota?.is_interview_required === true || quota?.is_interview_required === "1" || quota?.is_interview_required === "Yes"
    );

    const isPending =
        !selectedApplication?.app_status ||
        selectedApplication?.app_status?.toLowerCase() === 'pending';

    const filteredApplications = useMemo(() => {
        if (activeTab === "all") return applications;

        return applications.filter((app) =>
            (app.app_status || 'pending').toLowerCase() === activeTab
        );
    }, [activeTab, applications]);

    const handleOpenInterviewModal = (app: any) => {
        setInterviewApp(app);
        if (app.interview_date) {
            const d = new Date(app.interview_date);
            const tzOffset = d.getTimezoneOffset() * 60000;
            const localIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
            setInterviewDate(localIso);
        } else {
            setInterviewDate("");
        }
    };

    const updateStatus = (
        quotaId: number,
        applicationId: number,
        status: string,
        date?: string
    ) => {
        // Enforce interview date requirement when moving to Interviewing status
        if (status === 'Interviewing' && !date) {
            const targetApp = applications.find(a => (a.id || a.application_id) === applicationId);
            if (targetApp) {
                handleOpenInterviewModal(targetApp);
                return;
            }
        }

        const payload: any = { status: status };
        if (date) {
            payload.interview_date = date;
        }

        router.put(
            route('company.applications.update-status', {
                quota: quotaId,
                application: applicationId
            }),
            payload,
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    toast.success(`Status updated to ${status}`);
                    setInterviewApp(null);
                    setInterviewDate("");
                }
            }
        );
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!interviewDate) {
            toast.error("Please select a date and time for the interview.");
            return;
        }
        updateStatus(
            interviewApp.quota_id,
            interviewApp.id || interviewApp.application_id,
            'Interviewing',
            interviewDate
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

    // Pass activeTab to column renderer
    const columns = getColumns(
        updateStatus,
        setSelectedApplication,
        isInterviewRequired,
        handleOpenInterviewModal,
        activeTab
    );

    const currentIndex = selectedApplication
        ? applications.findIndex(
            a => (a.id || a.application_id) === (selectedApplication.id || selectedApplication.application_id)
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
                    <div>
                        <h1 className="font-sato text-3xl font-bold">
                            {quota.job_title}
                        </h1>
                        {!isInterviewRequired && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Direct placement position (No interview required)
                            </p>
                        )}
                    </div>

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
                            ...(isInterviewRequired ? [{ value: "interviewing", label: "Interview" }] : []),
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

            <Dialog open={!!interviewApp} onOpenChange={() => setInterviewApp(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleScheduleSubmit}>
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-muted-foreground">
                                Set an interview date and time for candidate: <strong className="text-foreground">{interviewApp?.student?.full_name}</strong>
                            </p>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold">
                                    Interview Date & Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={interviewDate}
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setInterviewApp(null)}>Cancel</Button>
                            <Button type="submit">Schedule Interview</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
                                {isInterviewRequired && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleOpenInterviewModal(selectedApplication)
                                        }
                                    >
                                        Schedule Interview
                                    </DropdownMenuItem>
                                )}
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
                                                selectedApplication?.id || selectedApplication?.application_id,
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
                                    {selectedApplication.student?.user_image ? (
                                        <img
                                            src={selectedApplication.student.user_image}
                                            className="rounded-full w-full h-full object-cover"
                                        />
                                    ) : (
                                        getInitials(
                                            selectedApplication.student?.full_name
                                        )
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-xl font-sato font-bold">
                                        {selectedApplication.student?.full_name}
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        {selectedApplication.student?.user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-2">
                                        Stage
                                    </p>

                                    <p className="text-sm font-normal">
                                        {isInterviewRequired ? 'Interview Stage' : 'Direct Review Stage'}
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

                            {isInterviewRequired && (
                                <div className="p-4 bg-slate-50 rounded-lg border space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Interview Details
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => handleOpenInterviewModal(selectedApplication)}
                                        >
                                            {selectedApplication.interview_date ? 'Reschedule' : 'Set Date'}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedApplication.interview_date
                                            ? `Scheduled for: ${new Date(selectedApplication.interview_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
                                            : 'No interview scheduled yet.'}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm">
                                    Academic Details
                                </h3>

                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <DetailItem
                                        label="Student ID"
                                        value={selectedApplication.student?.pb_student_code}
                                    />

                                    <DetailItem
                                        label="Email"
                                        value={selectedApplication.student?.user?.email}
                                    />

                                    <DetailItem
                                        label="Phone"
                                        value={selectedApplication.student?.phone}
                                    />

                                    <DetailItem
                                        label="CGPA"
                                        value={selectedApplication.student?.cgpa}
                                    />

                                    <DetailItem
                                        label="Programme"
                                        value={selectedApplication.student?.programme?.programme_name}
                                    />
                                </div>

                                {selectedApplication.student?.cv_file_path && (
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
                                            {isInterviewRequired ? 'Interview stage' : 'Application review stage'}
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