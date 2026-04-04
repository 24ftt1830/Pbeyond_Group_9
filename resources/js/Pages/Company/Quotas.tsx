import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Edit2, Search, Loader2 } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import QuotaCard from '@/Components/QuotaCard';
import { Toggle } from "@/Components/ui/toggle";
import { useForm } from '@inertiajs/react';
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

interface QuotaForm {
    programme_id: number | string;
    total_slots: number;
    min_cgpa: number;
    job_title: string;
    interview_required?: boolean;
}

export default function Quotas({ quotas = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const { data, setData, post, processing, reset, errors } = useForm<QuotaForm>({
        programme_id: '',
        total_slots: 10,
        min_cgpa: 2.5,
        job_title: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('company.quotas.store'), {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    }

    // Handle Delete
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this quota request?')) {
            router.delete(route('company.quotas.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    // Should have a toast notification here
                }
            });
        }
    };

    const mockQuotas = [
        { 
            quota_id: 1, 
            job_title: 'Software Engineer Intern (Mock)',
            programme: { name: 'Web Technology' }, 
            total_slots: 12, 
            min_cgpa: 2.5, 
            quota_status: 'Approved' 
        },
    ];

    const displayQuotas = quotas.length > 0 ? quotas : (searchTerm ? [] : mockQuotas);

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
                        className="flex items-center gap-2 border-slate-200 text-slate-600 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 shadow-sm"
                    >
                        <Edit2 className="size-4" />
                        Edit Mode
                    </Toggle>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 shadow-sm bg-slate-900 hover:bg-slate-800">
                                <Plus className="size-4" />
                                New Quota
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                            <form onSubmit={submit} className="flex flex-col h-full overflow-hidden">
                                <div className="bg-slate-900 p-8 text-white shrink-0">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Administration</h2>
                                    <DialogTitle className="text-2xl font-black text-white">Create New Quota</DialogTitle>
                                    <DialogDescription className="mt-1 text-xs text-slate-400">Set placement requirements for the upcoming semester.</DialogDescription>
                                </div>

                                <div className="px-8 space-y-6 overflow-y-auto py-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Job Title</Label>
                                        <Input 
                                            placeholder="e.g. Fullstack Developer Intern"
                                            value={data.job_title}
                                            onChange={e => setData('job_title', e.target.value)}
                                            className="h-11"
                                        />
                                        {errors.job_title && <p className="text-xs text-red-500">{errors.job_title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Select Programme</Label>
                                        <Select 
                                            value={data.programme_id.toString()} 
                                            onValueChange={(val) => setData('programme_id', parseInt(val))}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Choose a relevant programme..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Web Technology</SelectItem>
                                                <SelectItem value="2">Digital Arts & Media</SelectItem>
                                                <SelectItem value="3">Data Analytics</SelectItem>
                                                <SelectItem value="4">App Development</SelectItem>
                                                <SelectItem value="5">Cloud & Networking</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.programme_id && <p className="text-xs text-red-500">{errors.programme_id}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">Total Slots</Label>
                                            <QuotaNumberInput 
                                                defaultValue={data.total_slots} 
                                                onChange={(value) => setData('total_slots', value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">Min. CGPA</Label>
                                            <QuotaNumberInput
                                                defaultValue={data.min_cgpa}
                                                step={0.01}
                                                maxValue={4}
                                                onChange={(value) => setData('min_cgpa', value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="gap-3 p-6 border-t bg-slate-50 sm:justify-between shrink-0">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" className="flex-1 text-xs font-bold uppercase">Cancel</Button>
                                    </DialogClose>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="flex-[2] bg-slate-900 font-bold uppercase text-xs tracking-widest"
                                    >
                                        {processing ? <Loader2 className="size-4 animate-spin" /> : "Submit for Approval"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                    placeholder="Search by job title..."
                    className="h-12 pl-11 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {displayQuotas.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayQuotas
                        .filter(q => q.job_title?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(quota => (
                            <QuotaCard 
                                key={quota.quota_id} 
                                quota={quota} 
                                isEditMode={isEditMode}
                                onDelete={handleDelete}
                            />
                        ))
                    }
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center text-slate-400 text-sm">
                    No active quotas found. Start by adding a new one above.
                </div>
            )}
        </div>
    );
}

Quotas.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;