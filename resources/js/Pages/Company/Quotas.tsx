import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Plus, Edit2, Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import QuotaCard from '@/Components/QuotaCard';
import { Toggle } from "@/Components/ui/toggle";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/Components/ui/dialog";

import QuotaNumberInput from '@/Components/QuotaNumberInput';

export default function Quotas({ quotas = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const mockQuotas = [
        { id: 1, diploma: 'Web Technology', total_seats: 12, min_cgpa: 2.5, interview_required: true, status: 'approved' },
        { id: 2, diploma: 'Data Analytics', total_seats: 5, min_cgpa: 3.0, interview_required: false, status: 'pending' },
    ];

    const displayQuotas = quotas.length > 0 ? quotas : mockQuotas;

    return (
        <div className="w-full px-4 py-10 mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">
            <Head title="Quotas" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <header>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Quotas</h1>
                </header>

                <div className="flex items-center gap-3">
                    <Toggle
                        pressed={isEditMode}
                        onPressedChange={setIsEditMode}
                        variant="outline"
                        aria-label="Toggle edit mode"
                        className="flex items-center gap-2 border-slate-200 text-slate-600 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 shadow-sm"
                    >
                        <Edit2 className="size-4" />
                        Edit
                    </Toggle>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 shadow-sm bg-slate-900 hover:bg-slate-800">
                                <Plus className="size-4" />
                                New Quota
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl [&>button]:text-white flex flex-col max-h-[90vh]">

                            <div className="bg-slate-900 p-8 text-white relative border-none mt-[-1px] shrink-0">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                                    Administration
                                </h2>
                                <DialogTitle className="text-2xl font-black text-white">Create New Quota</DialogTitle>
                                <DialogDescription className="mt-1 text-xs leading-relaxed text-slate-400">
                                    Set placement requirements for the upcoming semester.
                                </DialogDescription>
                            </div>

                            <div className="px-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Select Diploma</Label>
                                    <Select>
                                        <SelectTrigger className="w-full h-11 border-slate-200">
                                            <SelectValue placeholder="Choose a relevant diploma..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="web-tech">Web Technology</SelectItem>
                                            <SelectItem value="digital-arts">Digital Arts & Media</SelectItem>
                                            <SelectItem value="data-analytics">Data Analytics</SelectItem>
                                            <SelectItem value="app-dev">App Development</SelectItem>
                                            <SelectItem value="cloud-net">Cloud & Networking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid items-end grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Total Seats</Label>
                                        <QuotaNumberInput defaultValue={10} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Min. CGPA (Max 3.0)</Label>
                                        <QuotaNumberInput
                                            defaultValue={2.50}
                                            step={0.01}
                                            maxValue={3}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-xl border-slate-100 bg-slate-50/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-slate-700">Interview Required</Label>
                                        <p className="text-[11px] text-slate-500">Enable mandatory screening process</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>

                            <DialogFooter className="gap-3 p-6 border-t bg-slate-50 border-slate-100 sm:justify-between shrink-0">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" className="flex-1 text-xs font-bold tracking-widest uppercase text-slate-500 hover:text-slate-900">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="flex-[2] bg-slate-900 font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors">
                                    Submit for Approval
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                    placeholder="Search by diploma or requirement..."
                    className="h-12 bg-white shadow-sm pl-11 border-slate-200 rounded-xl focus:ring-slate-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {displayQuotas.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayQuotas
                        .filter(q => q.diploma.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(quota => (
                            <QuotaCard key={quota.id} quota={quota} isEditMode={isEditMode} />
                        ))
                    }
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center text-slate-400 text-sm font-medium">
                    No active quotas found. Start by adding a new one above.
                </div>
            )}
        </div>
    );
}

Quotas.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
