import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Edit2, Search, Loader2, AlertCircle, CheckCircle2, Clock, Globe } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import QuotaCard from '@/Components/QuotaCard';
import { Toggle } from "@/Components/ui/toggle";
import { useForm, usePage } from '@inertiajs/react';
import { Switch } from "@/Components/ui/switch";
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
    interview_required: boolean;
}

export default function Quotas({ quotas = [], programmes = [] }) {
    const { auth } = usePage().props as any;
    const company = auth.user.company;

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<QuotaForm>({
        programme_id: '',
        total_slots: 1,
        min_cgpa: 2.0,
        job_title: '',
        interview_required: false,
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

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this quota request? Only pending quotas can be deleted.')) {
            router.delete(route('company.quotas.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="w-full px-4 py-10 mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">
            <Head title="My Quotas" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <header>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Placement Quotas</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage slots available for students in your company.</p>
                </header>

                <div className="flex items-center gap-3">
                    {!company && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="size-3.5" />
                            Account not linked to a company profile.
                        </div>
                    )}

                    <Toggle
                        pressed={isEditMode}
                        onPressedChange={setIsEditMode}
                        variant="outline"
                        className="flex items-center gap-2 border-slate-200 text-slate-600 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 shadow-sm"
                    >
                        <Edit2 className="size-4" />
                        Edit
                    </Toggle>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                disabled={!company} 
                                className="flex items-center gap-2 shadow-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
                            >
                                <Plus className="size-4" />
                                Request New Quota
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                            <form onSubmit={submit} className="flex flex-col h-full overflow-hidden">
                                <div className="bg-slate-900 p-8 text-white shrink-0">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Quota Submission</h2>
                                    <DialogTitle className="text-2xl font-black text-white">New Placement Request</DialogTitle>
                                    <DialogDescription className="mt-1 text-xs text-slate-400">
                                        Submissions are reviewed by the ILD Admin before appearing for students.
                                    </DialogDescription>
                                </div>

                                <div className="px-8 space-y-6 overflow-y-auto py-6">
                                    {/* Job Title */}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Proposed Job Title</Label>
                                        <Input
                                            placeholder="e.g. Web Technology Assistant"
                                            value={data.job_title}
                                            onChange={e => setData('job_title', e.target.value)}
                                            className="h-11"
                                        />
                                        {errors.job_title && <p className="text-xs text-red-500">{errors.job_title}</p>}
                                    </div>

                                    {/* Programme Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Target Academic Programme</Label>
                                        <Select
                                            value={data.programme_id.toString()}
                                            onValueChange={(val) => setData('programme_id', parseInt(val))}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select relevant course..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {programmes.map((p: any) => (
                                                    <SelectItem key={p.programme_id} value={p.programme_id.toString()}>
                                                        {p.programme_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.programme_id && <p className="text-xs text-red-500">{errors.programme_id}</p>}
                                    </div>

                                    {/* Slots and CGPA */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">Total Slots</Label>
                                            <QuotaNumberInput
                                                defaultValue={data.total_slots}
                                                onChange={(value) => setData('total_slots', value)}
                                            />
                                            {errors.total_slots && <p className="text-xs text-red-500">{errors.total_slots}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">Min. CGPA Requirement</Label>
                                            <QuotaNumberInput
                                                defaultValue={data.min_cgpa}
                                                step={0.1}
                                                maxValue={4}
                                                onChange={(value) => setData('min_cgpa', value)}
                                            />
                                            {errors.min_cgpa && <p className="text-xs text-red-500">{errors.min_cgpa}</p>}
                                        </div>
                                    </div>

                                    {/* Interview Switch */}
                                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold text-slate-700">Requires Interview</Label>
                                            <p className="text-[11px] text-slate-500">If checked, candidates are required to undergo screening.</p>
                                        </div>
                                        <Switch
                                            checked={data.interview_required}
                                            onCheckedChange={(checked) => setData('interview_required', checked)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-3 p-6 border-t bg-slate-50 sm:justify-between shrink-0">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" className="flex-1 text-xs font-bold uppercase">Back</Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-[2] bg-slate-900 font-bold uppercase text-xs tracking-widest"
                                    >
                                        {processing ? <Loader2 className="size-4 animate-spin" /> : "Submit Quota"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search and Quick Filters */}
            <div className="flex items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        placeholder="Filter by job title..."
                        className="h-12 pl-11 rounded-md border border-outline border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Quota Listing */}
            {quotas.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quotas
                        .filter((q: any) => q.job_title?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((quota: any) => (
                            <div key={quota.quota_id} className="relative group">
                                <QuotaCard
                                    quota={quota}
                                    isEditMode={isEditMode}
                                    onDelete={handleDelete}
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {quota.quota_status === 'Pending' && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">
                                            <Clock className="size-3" /> Pending Review
                                        </div>
                                    )}
                                    {quota.is_released && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase shadow-sm">
                                            <Globe className="size-3" /> Live
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    }
                </div>
            ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[300px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <Plus className="size-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-600">No placement quotas submitted yet.</p>
                    <p className="text-sm max-w-xs mt-1">Submit a new quota to start receiving student applications for the next cycle.</p>
                </div>
            )}
        </div>
    );
}

Quotas.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;