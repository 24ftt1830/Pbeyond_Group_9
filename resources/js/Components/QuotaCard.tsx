import { Trash2, Users, GraduationCap, ClipboardCheck } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

interface QuotaCardProps {
    quota: any;
    isEditMode: boolean;
}

export default function QuotaCard({ quota, isEditMode }: QuotaCardProps) {
    return (
        <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
            isEditMode ? 'border-blue-200 ring-1 ring-blue-50' : 'border-slate-200'
        }`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                            {quota.status}
                        </Badge>
                        <h3 className="text-lg font-bold text-slate-900">{quota.diploma}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-50">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Seats</span>
                        <p className="text-sm font-mono font-bold">{quota.total_seats}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">CGPA</span>
                        <p className="text-sm font-mono font-bold">{quota.min_cgpa}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Interview</span>
                        <p className="text-sm font-bold">{quota.interview_required ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>

            {isEditMode && (
                <div className="bg-slate-50 border-t border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Button 
                        variant="destructive" 
                        className="w-full flex items-center gap-2 h-9 text-xs font-bold uppercase tracking-widest"
                        onClick={() => {/* backend function to delete */}}
                    >
                        <Trash2 className="size-3.5" />
                        Delete Quota
                    </Button>
                </div>
            )}
        </div>
    );
}