import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { BriefcaseBusiness, CalendarDays, CalendarPlus, GraduationCap, Pencil, Users } from 'lucide-react';
import { toast } from 'sonner';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

type Intern = {
    application_id: number;
    student_id: number | null;
    student_code: string | null;
    full_name: string;
    programme_name: string | null;
    positions: string[];
    start_date: string | null;
    end_date: string | null;
    internship_status: 'Dates not set' | 'Upcoming' | 'In Progress' | 'Ended';
};

type Props = {
    interns: Intern[];
    companyName: string;
};

function formatDate(value: string | null) {
    if (!value) return 'Not set';

    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(year, month - 1, day));
}

function statusStyle(status: Intern['internship_status']) {
    switch (status) {
        case 'In Progress':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'Upcoming':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'Ended':
            return 'border-slate-200 bg-slate-100 text-slate-600';
        default:
            return 'border-amber-200 bg-amber-50 text-amber-800';
    }
}

export default function Interns({ interns = [], companyName }: Props) {
    const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const form = useForm({ start_date: '', end_date: '' });

    const summary = useMemo(() => ({
        total: interns.length,
        active: interns.filter((intern) => intern.internship_status === 'In Progress').length,
        needsDates: interns.filter((intern) => intern.internship_status === 'Dates not set').length,
    }), [interns]);

    const openDateEditor = (intern: Intern) => {
        setSelectedIntern(intern);
        form.clearErrors();
        form.setData({
            start_date: intern.start_date ?? '',
            end_date: intern.end_date ?? '',
        });
        setDialogOpen(true);
    };

    const closeDateEditor = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setSelectedIntern(null);
            form.clearErrors();
        }
    };

    const saveDates = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedIntern) return;

        form.put(route('company.interns.update-dates', { application: selectedIntern.application_id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Internship dates saved.');
                setDialogOpen(false);
                setSelectedIntern(null);
                form.reset();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                if (firstError) toast.error(String(firstError));
            },
        });
    };

    return (
        <>
            <Head title="Interns" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-blue-700">{companyName}</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Interns</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Set and manage internship dates for students your company has recruited.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.reload({ only: ['interns'] })}>
                        Refresh list
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Users className="h-5 w-5" /></div>
                            <div><p className="text-sm text-slate-500">Recruited students</p><p className="text-2xl font-bold text-slate-900">{summary.total}</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><BriefcaseBusiness className="h-5 w-5" /></div>
                            <div><p className="text-sm text-slate-500">Currently interning</p><p className="text-2xl font-bold text-slate-900">{summary.active}</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-xl bg-amber-50 p-3 text-amber-800"><CalendarPlus className="h-5 w-5" /></div>
                            <div><p className="text-sm text-slate-500">Dates not set</p><p className="text-2xl font-bold text-slate-900">{summary.needsDates}</p></div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Recruited students</CardTitle>
                        <CardDescription>Only students recruited for positions at {companyName} are shown here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {interns.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                                <Users className="mx-auto h-8 w-8 text-slate-400" />
                                <h2 className="mt-3 font-semibold text-slate-900">No recruited students yet</h2>
                                <p className="mt-1 text-sm text-slate-600">Students will appear here after you recruit them from Applications.</p>
                            </div>
                        ) : interns.map((intern) => (
                            <div key={`${intern.student_id ?? 'student'}-${intern.application_id}`} className="rounded-xl border border-slate-200 bg-white p-5">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0 space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div>
                                                <h2 className="text-lg font-semibold text-slate-900">{intern.full_name}</h2>
                                                <p className="text-sm text-slate-500">{intern.student_code || 'Student ID unavailable'}</p>
                                            </div>
                                            <Badge variant="outline" className={statusStyle(intern.internship_status)}>{intern.internship_status}</Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                                            {intern.programme_name && <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-slate-400" />{intern.programme_name}</span>}
                                            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" />{formatDate(intern.start_date)} – {formatDate(intern.end_date)}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {intern.positions.map((position) => (
                                                <Badge key={position} variant="secondary" className="font-medium">{position}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={() => openDateEditor(intern)} className="shrink-0">
                                        {intern.start_date || intern.end_date ? <Pencil className="mr-2 h-4 w-4" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
                                        {intern.start_date || intern.end_date ? 'Edit internship dates' : 'Set internship dates'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={closeDateEditor}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={saveDates}>
                        <DialogHeader>
                            <DialogTitle>{selectedIntern?.start_date || selectedIntern?.end_date ? 'Edit internship dates' : 'Set internship dates'}</DialogTitle>
                            <DialogDescription>
                                Set the confirmed internship period for {selectedIntern?.full_name ?? 'this student'}. These dates can be updated later.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-5">
                            <div className="space-y-2">
                                <Label htmlFor="internship-start-date">Start date</Label>
                                <Input id="internship-start-date" type="date" required value={form.data.start_date} onChange={(event) => form.setData('start_date', event.target.value)} />
                                {form.errors.start_date && <p className="text-sm text-rose-600">{form.errors.start_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="internship-end-date">End date</Label>
                                <Input id="internship-end-date" type="date" min={form.data.start_date || undefined} required value={form.data.end_date} onChange={(event) => form.setData('end_date', event.target.value)} />
                                {form.errors.end_date && <p className="text-sm text-rose-600">{form.errors.end_date}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => closeDateEditor(false)} disabled={form.processing}>Cancel</Button>
                            <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save dates'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Interns.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
