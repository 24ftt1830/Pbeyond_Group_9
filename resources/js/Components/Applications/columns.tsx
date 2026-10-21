import { ColumnDef } from "@tanstack/react-table";
import { Badge, badgeVariants, type BadgeProps } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import ApplicationMenu, { type ApplicationMenuAction } from './ApplicationMenu';
import { MoreHorizontal, Eye, Calendar, LockKeyhole } from "lucide-react";
import { canCompanyReviewApplication, hasFinalApplicationDecision, finalDecisionNotice } from '@/lib/application-review';

const getBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
        case "Recruited": return "success";
        case "Waitlisted": return "warning";
        case "Interviewing": return "info";
        case "Declined": return "destructive";
        case "Cancelled": return "secondary";
        default: return "warning";
    }
};

const reviewActions = (
    app: any,
    updateStatus: (quotaId: number, applicationId: number, status: string, date?: string) => void,
    isInterviewRequired: boolean,
    openInterviewModal?: (app: any) => void
): ApplicationMenuAction[] => {
    if (!canCompanyReviewApplication(app.app_status)) return [];
    return [
        ...(isInterviewRequired ? [{
            label: 'Schedule Interview', icon: <Calendar className="size-4" />,
            action: () => openInterviewModal ? openInterviewModal(app) : updateStatus(app.quota_id, app.id || app.application_id, 'Interviewing'),
        }] : []),
        { label: 'Recruit', disabled: app.app_status === 'Recruited', action: () => updateStatus(app.quota_id, app.id || app.application_id, 'Recruited') },
        { label: 'Decline', disabled: app.app_status === 'Declined', destructive: true, action: () => updateStatus(app.quota_id, app.id || app.application_id, 'Declined') },
    ];
};

export const getColumns = (
    updateStatus: (quotaId: number, applicationId: number, status: string, date?: string) => void,
    onViewDetails: (student: any) => void,
    isInterviewRequired: boolean = false,
    openInterviewModal?: (app: any) => void,
    activeTab: string = "all"
): ColumnDef<any>[] => [
    {
        accessorKey: "student.full_name",
        header: "Student",
    },
    {
        accessorKey: "student.programme.programme_name",
        header: "Programme",
        cell: ({ row }) => row.original.student?.programme?.programme_name || 'N/A',
    },
    {
        accessorKey: "app_status",
        header: "Status",
        cell: ({ row }) => {
            const app = row.original;
            const status = app.app_status || 'Pending';

            if (!canCompanyReviewApplication(status)) {
                const final = hasFinalApplicationDecision(status);
                return <div className="space-y-1">
                    <Badge variant={getBadgeVariant(status)} title={final ? finalDecisionNotice : undefined}>
                        {final && <LockKeyhole className="size-3" aria-hidden="true" />}{status}
                    </Badge>
                    {final && <p className="text-xs text-muted-foreground">Locked · email Admin for changes.</p>}
                </div>;
            }

            return <ApplicationMenu
                trigger={<button type="button" aria-label={`Change application status: ${status}`} className={badgeVariants({ variant: getBadgeVariant(status) }) + ' cursor-pointer hover:opacity-80'}>{status}</button>}
                actions={reviewActions(app, updateStatus, isInterviewRequired, openInterviewModal)}
            />;
        },
    },
    {
        accessorKey: "interview_date",
        header: "Schedule Interview",
        cell: ({ row }) => {
            const app = row.original;
            const date = app.interview_date;
            const status = app.app_status || 'Pending';

            // Only display schedule date if status is explicitly 'Interviewing'
            if (status !== 'Interviewing') {
                return <span className="text-muted-foreground text-xs">—</span>;
            }

            if (!date) {
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInterviewModal && openInterviewModal(app)}
                        className="text-xs h-7 border-dashed"
                    >
                        <Calendar className="h-3 w-3 mr-1" />
                        Set Date
                    </Button>
                );
            }

            return (
                <div
                    onClick={() => openInterviewModal && openInterviewModal(app)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer hover:underline"
                >
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(date).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Applied On",
        cell: ({ row }) => {
            const date = row.original.created_at;
            return date
                ? new Date(date).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                })
                : 'N/A';
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const app = row.original;
            const actions = reviewActions(app, updateStatus, isInterviewRequired, openInterviewModal);
            return <ApplicationMenu
                trigger={<Button variant="ghost" size="icon" aria-label="Application actions"><MoreHorizontal className="size-4" /></Button>}
                actions={[
                    { label: 'View Details', icon: <Eye className="size-4" />, action: () => onViewDetails(app) },
                    ...actions.map((action, index) => ({ ...action, separatorBefore: index === 0 })),
                ]}
            />;
        },
    },
];
