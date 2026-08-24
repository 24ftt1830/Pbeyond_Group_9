import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/Components/ui/dropdown-menu";
import { MoreHorizontal, Eye, MessageCircle, Calendar } from "lucide-react";

const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case "Recruited": return "default";
        case "Waitlisted": return "secondary";
        case "Interviewing": return "secondary";
        case "Declined": return "destructive";
        default: return "outline";
    }
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

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Badge
                            variant={getBadgeVariant(status)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {status}
                        </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {isInterviewRequired && (
                            <DropdownMenuItem
                                onClick={() => openInterviewModal ? openInterviewModal(app) : updateStatus(app.quota_id, app.id || app.application_id, "Interviewing")}
                            >
                                Schedule Interview
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={() => updateStatus(app.quota_id, app.id || app.application_id, "Waitlisted")}
                        >
                            Waitlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => updateStatus(app.quota_id, app.id || app.application_id, "Recruited")}
                        >
                            Recruit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => updateStatus(app.quota_id, app.id || app.application_id, "Declined")}
                        >
                            Decline
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
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
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-transparent">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert('Remark feature coming soon')}>
                            <MessageCircle className="w-4 h-4 mr-2" /> Remark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewDetails(app)}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {isInterviewRequired && (
                            <DropdownMenuItem 
                                onClick={() => openInterviewModal ? openInterviewModal(app) : updateStatus(app.quota_id, app.id || app.application_id, "Interviewing")}
                            >
                                <Calendar className="w-4 h-4 mr-2 text-primary" /> Schedule Interview
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                            onClick={() => updateStatus(app.quota_id, app.id || app.application_id, "Waitlisted")}
                        >
                            Waitlist
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => updateStatus(app.quota_id, app.id || app.application_id, "Recruited")}
                        >
                            Recruit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => updateStatus(app.quota_id, app.id || app.application_id, "Declined")}
                        >
                            Decline
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];