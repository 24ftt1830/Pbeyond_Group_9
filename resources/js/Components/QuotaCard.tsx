import { Trash2 } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { cn } from "@/lib/utils"; 

interface QuotaCardProps {
    quota: {
        quota_id: number;
        job_title: string;
        total_slots: number;
        min_cgpa: string | number;
        quota_status: string;
        programme?: {
            programme_name: string;
        };
        interview_required?: boolean;
    };
    isEditMode: boolean;
    onDelete?: (id: number) => void;
}

export default function QuotaCard({ quota, isEditMode, onDelete }: QuotaCardProps) {
    return (
        <Card className={cn(
            "shadow-none h-full", 
            isEditMode && "border-destructive/50 ring-1 ring-destructive/10"
        )}>
            <CardHeader className="pb-4 pr-24"> 
                <div className="flex flex-col items-start gap-1">
                    <h3 className="text-lg font-bold leading-tight tracking-tight">
                        {quota.job_title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                        {quota.programme?.programme_name || 'General Programme'}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Seats</span>
                    <p className="text-sm font-mono font-bold">{quota.total_slots}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">CGPA</span>
                    <p className="text-sm font-mono font-bold">{quota.min_cgpa}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Interview</span>
                    <p className="text-sm font-bold">{quota.interview_required ? 'Yes' : 'No'}</p>
                </div>
            </CardContent>

            {isEditMode && (
                <div className="bg-muted/50 p-3 border-t border-border">
                    <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full flex items-center gap-2"
                        onClick={() => onDelete?.(quota.quota_id)}
                    >
                        <Trash2 className="size-3.5" />
                        Delete Quota
                    </Button>
                </div>
            )}
        </Card>
    );
}