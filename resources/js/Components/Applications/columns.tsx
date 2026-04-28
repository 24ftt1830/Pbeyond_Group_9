import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { MoreHorizontal, Eye, MessageCircle } from "lucide-react";

const STATUS_OPTIONS = [
    { label: "Waitlist", value: "Waitlisted" },
    { label: "Recruit", value: "Recruited" },
    { label: "Decline", value: "Declined" },
];

const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case "Recruited": return "default";
        case "Waitlisted": return "secondary";
        case "Declined": return "destructive";
        default: return "outline";
    }
};

export const getColumns = (
    updateStatus: (quotaId: number, applicationId: number, status: string) => void,
    onViewDetails: (student: any) => void
): ColumnDef<any>[] => [
        {
            accessorKey: "student.full_name",
            header: "Student",
        },
        {
            accessorKey: "student.programme.programme_name",
            header: "Programme",
            cell: ({ row }) => row.original.student.programme?.programme_name || 'N/A',
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
                            {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => updateStatus(app.quota_id, app.application_id, opt.value)}
                                >
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                            <Button variant="ghost" size="icon" className="bg-transparent"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert('Remark feature coming soon')}>
                                <MessageCircle className="w-4 h-4" /> Remark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewDetails(app)}>
                                <Eye className="w-4 h-4" /> View Details
                            </DropdownMenuItem>
                            {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuItem 
                                key={opt.value} 
                                onClick={() => updateStatus(app.quota_id, app.id, opt.value)}>
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];