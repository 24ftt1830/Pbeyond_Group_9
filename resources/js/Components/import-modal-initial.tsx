import { useState } from 'react';
import { 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { DownloadCsvTemplate } from "@/Components/ui/download-csv-template";
import { Upload, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from "@/Components/ui/sheet";

interface Programme {
    programme_id: number | string;
    programme_name: string;
}

export function ImportModal({ 
    form, 
    onComplete, 
    programmes 
}: { 
    form: any; 
    onComplete: () => void; 
    programmes: Programme[]; 
}) {
    const FORCE_INSTRUCTIONS = true;

    const [view, setView] = useState(() => {
        if (!FORCE_INSTRUCTIONS && typeof window !== 'undefined' && localStorage.getItem('hasSeenImportInstructions')) {
            return 'upload';
        }
        return 'instructions';
    });

    const handleAcknowledge = () => {
        localStorage.setItem('hasSeenImportInstructions', 'true');
        setView('upload');
    };

    return (
        <DialogContent className="sm:max-w-lg p-6">
            {view === 'instructions' ? (
                <>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
                            Before you import...
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 pt-2 py-4">
                        {[
                            { text: "Usernames and emails are automatically generated using the", highlight: "Student Code" },
                            { text: "Every student's default password is their", highlight: "Student Code" },
                            { text: "Students are advised to change their password upon their first login." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600 shadow-sm">
                                    {i + 1}
                                </div>
                                <p className="leading-6 text-sm text-slate-600 pt-0.5">
                                    {item.text}
                                    {item.highlight && (
                                        <>
                                            <code className="ml-1.5 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                                                {item.highlight}
                                            </code>.
                                        </>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="button" className="w-full" onClick={handleAcknowledge}>
                            Understood, proceed to upload
                        </Button>
                    </DialogFooter>
                </>
            ) : (
                <>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-slate-900">Upload File</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* 1. Primary Action: The Upload Zone */}
                        <div
                            className={cn(
                                "group relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-all cursor-pointer",
                                form.data.file
                                    ? "border-emerald-300 bg-emerald-50/50"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            )}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".xlsx, .xls, .csv"
                                onChange={(e) => form.setData('file', e.target.files?.[0] || null)}
                            />
                            
                            <div className={cn("p-3 rounded-full mb-3", form.data.file ? "bg-emerald-100" : "bg-slate-100")}>
                                {form.data.file ? (
                                    <FileSpreadsheet className="size-8 text-emerald-600" />
                                ) : (
                                    <Upload className="size-8 text-slate-400" />
                                )}
                            </div>

                            <p className="text-sm font-medium text-slate-700 mb-1">
                                {form.data.file ? form.data.file.name : "Choose a file or drag & drop it here."}
                            </p>
                            {!form.data.file && (
                                <p className="text-xs text-slate-400 mb-4">CSV or Excel format, up to 25MB.</p>
                            )}

                            <div 
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-md border border-slate-200 transition-colors"
                            >
                                {form.data.file ? "Change file" : "Browse file"}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <DownloadCsvTemplate href="/templates/student-import-template.xlsx" />

                            <div className="flex justify-start">
                                <Sheet>
                                    <p className="text-xs text-slate-500">
                                        Don't know the Programme ID? Refer to the{" "}
                                        <SheetTrigger asChild>
                                            <button 
                                                type="button" 
                                                className="underline underline-offset-4 text-slate-500 hover:text-slate-900 transition-colors"
                                            >
                                                reference list.
                                            </button>
                                        </SheetTrigger>
                                    </p>
                                    
                                    <SheetContent className="w-[400px] sm:w-[540px]">
                                        <SheetHeader>
                                            <SheetTitle>Programme Reference</SheetTitle>
                                            <SheetDescription>
                                                Use these IDs when preparing your spreadsheet.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 overflow-y-auto h-[calc(100vh-120px)] pr-2">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 sticky top-0">
                                                    <tr>
                                                        <th className="py-2 px-3 font-semibold text-slate-700">ID</th>
                                                        <th className="py-2 px-3 font-semibold text-slate-700">Programme Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {programmes.map((p) => (
                                                        <tr key={p.programme_id}>
                                                            <td className="py-3 px-3 font-mono text-slate-600">{p.programme_id}</td>
                                                            <td className="py-3 px-3 text-slate-700">{p.programme_name}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={onComplete}
                            disabled={form.processing || !form.data.file}
                            className="w-full"
                        >
                            {form.processing ? 'Importing...' : 'Start Import'}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
    );
}