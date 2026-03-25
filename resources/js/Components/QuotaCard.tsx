import { Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

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
    
    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return {
                    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    icon: <CheckCircle2 className="size-3 mr-1" />,
                    label: "Approved"
                };
            case 'rejected':
                return {
                    className: "bg-red-50 text-red-600 border-red-100",
                    icon: <XCircle className="size-3 mr-1" />,
                    label: "Rejected"
                };
            default: // Pending
                return {
                    className: "bg-amber-50 text-amber-600 border-amber-100",
                    icon: <Clock className="size-3 mr-1" />,
                    label: "Pending Review"
                };
        }
    };

    const status = getStatusStyles(quota.quota_status);

    return (
        <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
            isEditMode ? 'border-red-200 ring-1 ring-red-50' : 'border-slate-200'
        }`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <Badge 
                            variant="outline" 
                            className={`${status.className} text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 flex items-center w-fit mb-2`}
                        >
                            {status.icon}
                            {status.label}
                        </Badge>
                        
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {quota.job_title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 font-medium">
                            {quota.programme?.programme_name || 'General Programme'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Seats</span>
                        <p className="text-sm font-mono font-bold text-slate-700">{quota.total_slots}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">CGPA</span>
                        <p className="text-sm font-mono font-bold text-slate-700">{quota.min_cgpa}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Interview</span>
                        <p className="text-sm font-bold text-slate-700">
                            {quota.interview_required ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div>
            </div>

            {isEditMode && (
                <div className="bg-slate-50 border-t border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Button 
                        variant="destructive" 
                        className="w-full flex items-center gap-2 h-9 text-xs font-bold uppercase tracking-widest"
                        onClick={() => onDelete && onDelete(quota.quota_id)}
                    >
                        <Trash2 className="size-3.5" />
                        Delete Quota
                    </Button>
                </div>
            )}
        </div>
    );
}