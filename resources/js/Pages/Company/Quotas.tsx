import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Edit2, Search, Loader2, AlertCircle, Clock, Globe } from 'lucide-react';

import { Input } from '@/Components/ui/input';
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Toggle } from "@/Components/ui/toggle";
import { Switch } from "@/Components/ui/switch";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";

import QuotaCard from '@/Components/QuotaCard';
import QuotaNumberInput from '@/Components/QuotaNumberInput';
import DatePickerTime from '@/Components/QuotaCalendar';

export default function Quotas({ quotas = [], programmes = [] }) {
    const { auth } = usePage().props as any;
    const company = auth.user.company;

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        programme_id: '',
        total_slots: 1,
        min_cgpa: 2.0,
        job_title: '',
        interview_required: false,
        application_deadline: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('company.quotas.store'), {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this quota request?')) {
            router.delete(route('company.quotas.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <div className="container py-10 mx-auto space-y-8 max-w-7xl">
            <Head title="Placement Quotas" />

            {/* Header Section */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Placement Quotas</h1>
                    <p className="text-muted-foreground mt-1">Manage and track student placement opportunities.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Toggle
                        pressed={isEditMode}
                        onPressedChange={setIsEditMode}
                        variant="outline"
                        className="gap-2"
                    >
                        <Edit2 className="size-4" />
                        Edit Mode
                    </Toggle>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!company} className="gap-2">
                                <Plus className="size-4" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px]">
                            <form onSubmit={submit}>
                                <DialogHeader className="mb-4">
                                    <DialogTitle>New Placement Request</DialogTitle>
                                    <DialogDescription>
                                        Submit a quota request for admin review.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            value={data.job_title}
                                            onChange={e => setData('job_title', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Academic Programme</Label>
                                        <Select
                                            value={data.programme_id.toString()}
                                            onValueChange={(val) => setData('programme_id', parseInt(val) as any)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a programme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {programmes.map((p: any) => (
                                                    <SelectItem key={p.programme_id} value={p.programme_id.toString()}>
                                                        {p.programme_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Total Slots</Label>
                                            <QuotaNumberInput defaultValue={data.total_slots} onChange={(v) => setData('total_slots', v)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Min. CGPA</Label>
                                            <QuotaNumberInput defaultValue={data.min_cgpa} step={0.1} maxValue={4} onChange={(v) => setData('min_cgpa', v)} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-md border p-4">
                                        <div className="space-y-0.5">
                                            <Label>Requires Interview</Label>
                                            <p className="text-xs text-muted-foreground">Students must undergo screening.</p>
                                        </div>
                                        <Switch checked={data.interview_required} onCheckedChange={(v) => setData('interview_required', v)} />
                                    </div>
                                </div>

                                <DialogFooter className="mt-6">
                                    <DialogClose asChild>
                                        <Button variant="ghost">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>Submit Request</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Warning Banner */}
            {!company && (
                <div className="flex items-center gap-3 p-4 text-sm bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                    <AlertCircle className="size-4" />
                    <span>Account is not linked to a company profile.</span>
                </div>
            )}

            {/* Filter Section */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search by job title..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                                        <span className="flex items-center gap-1 text-[10px] font-medium uppercase px-2 py-1 rounded bg-amber-100 text-amber-700">
                                            <Clock className="size-3" /> Pending
                                        </span>
                                    )}
                                    {quota.is_released && (
                                        <span className="flex items-center gap-1 text-[10px] font-medium uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                                            <Globe className="size-3" /> Live
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    }
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center text-center text-muted-foreground">
                    <div className="p-3 bg-muted rounded-full mb-4">
                        <Plus className="size-6" />
                    </div>
                    <p className="font-semibold text-foreground">No quotas found</p>
                    <p className="text-sm max-w-xs mt-1">Submit your first placement request to get started.</p>
                </div>
            )}
        </div>
    );
}

Quotas.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;