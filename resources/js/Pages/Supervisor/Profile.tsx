import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { CircleUserRound, Pencil } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { toast } from 'sonner';

interface SupervisorDetails {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    company_name?: string | null;
    position?: string | null;
}

interface Props {
    supervisor: SupervisorDetails | null;
    supervisorType: 'academic' | 'industry';
}

export default function Profile({ supervisor, supervisorType }: Props) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ full_name: supervisor?.full_name ?? '', phone: supervisor?.phone ?? '' });
    const roleLabel = supervisorType === 'industry' ? 'Industry Supervisor' : 'PB Supervisor';
    const initials = supervisor?.full_name?.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const details = supervisor ? [
        ['Full name', supervisor.full_name],
        ['Email address', supervisor.email],
        ['Phone number', supervisor.phone],
        ...(supervisorType === 'industry' ? [
            ['Company', supervisor.company_name],
            ['Position', supervisor.position],
        ] : []),
    ].filter(([, value]) => value?.trim()) : [];
    const readOnlyDetails = details.filter(([label]) => label !== 'Full name' && label !== 'Phone number');

    const startEditing = () => {
        form.setData({ full_name: supervisor?.full_name ?? '', phone: supervisor?.phone ?? '' });
        form.clearErrors();
        setEditing(true);
    };
    const cancelEditing = () => {
        form.reset();
        form.clearErrors();
        setEditing(false);
    };
    const saveProfile = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (form.processing) return;
        form.patch(route(supervisorType === 'industry' ? 'industry-supervisor.profile.update' : 'academic-supervisor.profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults();
                setEditing(false);
                toast.success('Profile updated.');
            },
        });
    };

    return <AuthenticatedLayout>
        <Head title="My profile" />
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <header className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-semibold text-primary">
                    {initials || <CircleUserRound className="size-8" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">My profile</h1>
                    <p className="mt-1 break-words text-sm text-slate-600">{supervisor?.full_name || roleLabel}</p>
                    <p className="mt-1 text-sm text-slate-500">{roleLabel}</p>
                </div>
            </header>
            <section className="ui-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="supervisor-details">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div><h2 id="supervisor-details" className="text-lg font-semibold text-slate-900">Supervisor details</h2>
                        <p className="mt-1 text-sm text-slate-500">Your contact and professional information.</p></div>
                    {supervisor && !editing && <Button type="button" variant="outline" onClick={startEditing}><Pencil aria-hidden="true" />Edit profile</Button>}
                </div>
                {editing ? <form onSubmit={saveProfile} className="mt-6 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="supervisor-name">Full name</Label>
                            <Input id="supervisor-name" value={form.data.full_name} onChange={event => form.setData('full_name', event.target.value)} required maxLength={supervisorType === 'industry' ? 150 : 255} autoComplete="name" autoFocus disabled={form.processing} aria-invalid={!!form.errors.full_name} aria-describedby={form.errors.full_name ? 'supervisor-name-error' : undefined} />
                            {form.errors.full_name && <p id="supervisor-name-error" className="text-sm text-red-600">{form.errors.full_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supervisor-phone">Phone number</Label>
                            <Input id="supervisor-phone" type="tel" value={form.data.phone} onChange={event => form.setData('phone', event.target.value)} maxLength={supervisorType === 'industry' ? 20 : 255} autoComplete="tel" disabled={form.processing} aria-invalid={!!form.errors.phone} aria-describedby={form.errors.phone ? 'supervisor-phone-error' : undefined} />
                            {form.errors.phone && <p id="supervisor-phone-error" className="text-sm text-red-600">{form.errors.phone}</p>}
                        </div>
                    </div>
                    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{readOnlyDetails.map(([label, value]) => <div key={label}>
                        <dt className="text-sm text-slate-500">{label}</dt><dd className="mt-2 break-words text-sm font-medium text-slate-900">{value}</dd>
                    </div>)}</dl>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <Button type="button" variant="outline" onClick={cancelEditing} disabled={form.processing}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save changes'}</Button>
                    </div>
                </form> : details.length > 0 ? <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                    {details.map(([label, value]) => <div key={label}>
                        <dt className="text-sm text-slate-500">{label}</dt>
                        <dd className="mt-2 break-words text-sm font-medium text-slate-900">{value}</dd>
                    </div>)}
                </dl> : <p className="mt-6 text-sm text-slate-500">Your supervisor details have not been provided yet.</p>}
            </section>
        </main>
    </AuthenticatedLayout>;
}
