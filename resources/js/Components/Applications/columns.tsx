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

export const getColumns = (
    updateStatus: (id: number, status: string) => void,
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
                const colors: Record<string, string> = {
                    Recruited: 'bg-green-500',
                    Waitlisted: 'bg-yellow-500',
                    Declined: 'bg-red-500',
                    Pending: 'bg-gray-400'
                };
                const status = app.app_status || 'Pending';
                const badgeColor = colors[status] || 'bg-gray-500';

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Badge className={`cursor-pointer ${colors[app.app_status] || 'bg-gray-500'}`}>
                                {app.app_status || 'Pending'}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuItem key={opt.value} onClick={() => updateStatus(app.application_id, opt.value)}>
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
        {
            accessorKey: "apply_date",
            header: "Applied On",
            cell: ({ row }) => {
                const date = row.original.apply_date;
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
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert('Remark feature coming soon')}>
                                <MessageCircle className="w-4 h-4" /> Remark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewDetails(app.student)}>
                                <Eye className="w-4 h-4" /> View Details
                            </DropdownMenuItem>
                            {/* Status Actions in the main menu */}
                            {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuItem key={opt.value} onClick={() => updateStatus(app.application_id, opt.value)}>
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];