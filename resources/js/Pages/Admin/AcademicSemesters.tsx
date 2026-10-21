import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, Pencil, Plus } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

type Semester = { id: number; name: string; starts_on: string; ends_on: string };
const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(`${value.slice(0, 10)}T00:00:00`));

export default function AcademicSemesters({ semesters = [] }: { semesters: Semester[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Semester | null>(null);
    const form = useForm({ name: '', starts_on: '', ends_on: '' });

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (semester: Semester) => {
        setEditing(semester);
        form.setData({ name: semester.name, starts_on: semester.starts_on.slice(0, 10), ends_on: semester.ends_on.slice(0, 10) });
        form.clearErrors();
        setOpen(true);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
        if (editing) form.put(route('admin.academic-semesters.update', editing.id), options);
        else form.post(route('admin.academic-semesters.store'), options);
    };

    return <>
        <Head title="Academic Semesters" />
        <main className="mx-auto max-w-5xl space-y-6 p-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-blue-700">Superadmin Management</p>
                    <h1 className="font-sans text-3xl font-semibold text-slate-900">Academic Semesters</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Set the term dates used for student intakes, internship positions, and dashboard filters.</p>
                </div>
                <Button onClick={openCreate} className="gap-2"><Plus className="size-4" />Add semester</Button>
            </header>

            <section className="overflow-hidden rounded-xl border bg-white">
                <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Semester</span><span>Date range</span><span className="sr-only">Actions</span>
                </div>
                {semesters.map((semester) => <div key={semester.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 border-b px-5 py-4 last:border-0">
                    <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><CalendarDays className="size-4" /></span><span className="font-medium text-slate-900">{semester.name}</span></div>
                    <span className="text-sm text-slate-600">{formatDate(semester.starts_on)} – {formatDate(semester.ends_on)}</span>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(semester)}><Pencil className="size-3.5" />Edit</Button>
                </div>)}
                {!semesters.length && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No semesters have been added.</p>}
            </section>
        </main>

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit semester dates' : 'Add semester'}</DialogTitle>
                    <DialogDescription>Semester periods cannot overlap because intake progression follows their date order.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2"><Label htmlFor="semester-name">Semester name</Label><Input id="semester-name" required value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />{form.errors.name && <p className="text-sm text-red-600">{form.errors.name}</p>}</div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2"><Label htmlFor="semester-start">Start date</Label><Input id="semester-start" type="date" required value={form.data.starts_on} onChange={(event) => form.setData('starts_on', event.target.value)} />{form.errors.starts_on && <p className="text-sm text-red-600">{form.errors.starts_on}</p>}</div>
                        <div className="space-y-2"><Label htmlFor="semester-end">End date</Label><Input id="semester-end" type="date" required min={form.data.starts_on} value={form.data.ends_on} onChange={(event) => form.setData('ends_on', event.target.value)} />{form.errors.ends_on && <p className="text-sm text-red-600">{form.errors.ends_on}</p>}</div>
                    </div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : editing ? 'Save changes' : 'Add semester'}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>;
}

AcademicSemesters.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
