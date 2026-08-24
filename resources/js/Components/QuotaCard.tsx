import { Trash2, Edit2, Clock, Globe, CircleX } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";

interface QuotaCardProps {
    quota: {
        quota_id: number;
        job_title: string;
        skills?: string[] | string;
        total_slots: number;
        quota_status: string;
        is_released?: boolean;
        interview_required?: boolean;

        programme?: {
            programme_name: string;
        };

        programmes?: {
            programme_id: number;
            programme_name: string;
            school?: {
                school_name: string;
            };
        }[];
    };

    isEditMode: boolean;
    onDelete?: (id: number) => void;
    onEdit?: (quota: any) => void;
}

export default function QuotaCard({
    quota,
    isEditMode,
    onDelete,
    onEdit,
}: QuotaCardProps) {
    const programmeName =
        quota.programme?.programme_name ||
        quota.programmes?.[0]?.programme_name ||
        'General Programme';

    // Parse skills if passed as JSON string, otherwise array
    const skillsList: string[] = Array.isArray(quota.skills)
        ? quota.skills
        : typeof quota.skills === 'string'
        ? JSON.parse(quota.skills || '[]')
        : [];

    return (
        <Card
            className={cn(
                "h-full overflow-hidden shadow-none",
                isEditMode &&
                    "border-destructive/50 ring-1 ring-destructive/10"
            )}
        >
            {/* Header */}
            <CardHeader className="px-6 py-5">
                <div className="flex items-start justify-between gap-5">

                    {/* Job information */}
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold leading-tight tracking-tight">
                            {quota.job_title}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {programmeName}
                        </p>

                        {/* Render Skills Badges */}
                        {skillsList.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {skillsList.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-[11px] font-normal px-2 py-0.5"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status + Edit */}
                    <div className="flex w-[86px] shrink-0 flex-col items-stretch gap-2">

                        {/* Pending */}
                        {quota.quota_status === 'Pending' && (
                            <div className="flex h-7 items-center justify-center gap-1 rounded-md bg-amber-100 px-2 text-[10px] font-semibold uppercase text-amber-700">
                                <Clock className="size-3" />
                                Pending
                            </div>
                        )}

                        {/* Live */}
                        {quota.is_released && (
                            <div className="flex h-7 items-center justify-center gap-1 rounded-md bg-emerald-100 px-2 text-[10px] font-semibold uppercase text-emerald-700">
                                <Globe className="size-3" />
                                Live
                            </div>
                        )}

                        {/* Rejected */}
                        {quota.quota_status === 'Rejected' && (
                            <div className="flex h-7 items-center justify-center gap-1 rounded-md bg-red-100 px-2 text-[10px] font-semibold uppercase text-red-700">
                                <CircleX className="size-3" />
                                Rejected
                            </div>
                        )}

                        {/* Edit */}
                        {quota.quota_status !== 'Approved' && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                title="Edit quota"
                                onClick={() => onEdit?.(quota)}
                                className="h-8 w-full justify-center gap-1.5 bg-background px-2 text-xs shadow-sm"
                            >
                                <Edit2 className="size-3.5" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            {/* Details */}
            <CardContent className="grid grid-cols-2 gap-4 border-t border-border px-6 py-5">

                <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                        Seats
                    </span>

                    <p className="text-sm font-mono font-bold">
                        {quota.total_slots}
                    </p>
                </div>

                <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                        Interview
                    </span>

                    <p className="text-sm font-bold">
                        {quota.interview_required
                            ? 'Yes'
                            : 'No'}
                    </p>
                </div>
            </CardContent>

            {/* Delete */}
            {isEditMode && (
                <div className="border-t border-border bg-muted/50 p-3">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex w-full items-center justify-center gap-2"
                        onClick={() =>
                            onDelete?.(quota.quota_id)
                        }
                    >
                        <Trash2 className="size-3.5" />
                        Delete Quota
                    </Button>
                </div>
            )}
        </Card>
    );
}