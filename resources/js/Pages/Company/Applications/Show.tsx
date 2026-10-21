import { confirmAction } from '@/lib/confirm-action';
import { canCompanyReviewApplication, finalDecisionNotice } from '@/lib/application-review';
import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from "@/Components/ui/data-table";
import { getColumns } from '@/Components/Applications/columns';
import DecisionNotice from '@/Components/Applications/DecisionNotice';
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
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";

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
    const [interviewApp, setInterviewApp] = useState<any | null>(null);
    const [interviewDate, setInterviewDate] = useState("");

    const isInterviewRequired = Boolean(
        requiresInterview ||
        quota?.has_interview === 1 || quota?.has_interview === true || quota?.has_interview === "1" || quota?.has_interview === "Yes" ||
        quota?.requires_interview === 1 || quota?.requires_interview === true || quota?.requires_interview === "1" || quota?.requires_interview === "Yes" ||
        quota?.interview_required === 1 || quota?.interview_required === true || quota?.interview_required === "1" || quota?.interview_required === "Yes" ||
        quota?.is_interview_required === 1 || quota?.is_interview_required === true || quota?.is_interview_required === "1" || quota?.is_interview_required === "Yes"
    );

    const filteredApplications = useMemo(() => {
        if (activeTab === "all") return applications;

        return applications.filter((app) =>
            (app.app_status || 'pending').toLowerCase() === activeTab
        );
    }, [activeTab, applications]);

    const handleOpenInterviewModal = (app: any) => {
        if (!canCompanyReviewApplication(app.app_status)) return;
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

    const updateStatus = async (
        quotaId: number,
        applicationId: number,
        status: string,
        date?: string
    ) => {
        const application = applications.find(app => (app.id || app.application_id) === applicationId);
        if (!application || !canCompanyReviewApplication(application.app_status)) {
            toast.error(finalDecisionNotice);
            return;
        }
        if (status === 'Declined' && !(await confirmAction('Reject this application? The student will be notified.\n\n' + finalDecisionNotice))) return;
        if (status === 'Recruited' && !(await confirmAction('Accept this application and recruit this student? The student will be notified.\n\n' + finalDecisionNotice, { title: 'Accept application?', confirmLabel: 'Accept application', destructive: false }))) return;
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
                preserveState: true,
                onSuccess: () => {
                    toast.success(`Status updated to ${status}`);
                    setInterviewApp(null);
                    setInterviewDate("");
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError || 'Unable to update the application status.'));
                },
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
            route('company.quotas.close', quota.quota_id || quota.id),
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
        (application) => router.visit(route('company.applications.details', application.id || application.application_id)),
        isInterviewRequired,
        handleOpenInterviewModal,
        activeTab
    );

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
                        <h1 className="font-sans text-3xl font-semibold">
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
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Close Position
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="mb-6"><DecisionNotice /></div>

                <div className="mb-6">
                    <AnimatedTabsList
                        groupId="student-applications"
                        activeValue={activeTab}
                        setActiveValue={setActiveTab}
                        tabs={[
                            { value: "all", label: "All applications" },
                            ...(isInterviewRequired ? [{ value: "interviewing", label: "Interview" }] : []),
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
                                <label className="text-sm font-semibold">
                                    Interview Date & Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={interviewDate}
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                    className="ui-field w-full bg-background px-3 py-2"
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


        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);
