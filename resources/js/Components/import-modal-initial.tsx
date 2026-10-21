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
import { Errors } from '@/Components/Admin/RecordControls';
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

interface AcademicSemester {
    id: number;
    name: string;
}

export function ImportModal({
    form,
    onComplete,
    programmes,
    academicSemesters,
}: {
    form: any;
    onComplete: () => void;
    programmes: Programme[];
    academicSemesters: AcademicSemester[];
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
                            { text: "Include each student's correct email in the email column. If omitted, the school email is generated from their Student Code." },
                            { text: "Importing adds student records without sending emails or releasing login access." },
                            { text: "When ready, use Send account invitations. Existing passwords and invitation states are preserved when you reimport." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-600 shadow-sm">
                                    {i + 1}
                                </div>
                                <p className="leading-6 text-sm text-slate-600 pt-0.5">
                                    {item.text}
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
                        <div className="space-y-2">
                            <label htmlFor="student-import-intake" className="text-sm font-medium text-slate-700">Intake semester for this import</label>
                            <select
                                id="student-import-intake"
                                value={form.data.intake_semester_id}
                                onChange={(event) => form.setData('intake_semester_id', event.target.value)}
                                className="ui-field h-10 w-full px-3"
                            >
                                <option value="">Select intake semester</option>
                                {academicSemesters.map((semester) => <option key={semester.id} value={String(semester.id)}>{semester.name}</option>)}
                            </select>
                        </div>

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
                                className="ui-field hidden"
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
                                className="text-sm font-medium text-primary hover:text-primary bg-white px-4 py-2 rounded-md border border-slate-200 transition-colors"
                            >
                                {form.data.file ? "Change file" : "Browse file"}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <DownloadCsvTemplate href="/templates/student-import-template.csv" description="Includes an email column for account invitations." />

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
                                            <table className="ui-table w-full text-sm text-left">
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

                    <Errors errors={form.errors} />
                    <DialogFooter>
                        <Button
                            onClick={onComplete}
                            disabled={form.processing || !form.data.file || !form.data.intake_semester_id}
                            className="w-full"
                        >
                            {form.processing ? 'Importing...' : 'Import'}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
    );
}
