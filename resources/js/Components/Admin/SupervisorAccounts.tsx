import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Pencil } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { DataTable } from '@/Components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Errors, Field } from '@/Components/Admin/RecordControls';

export type Supervisor = { id: number; type: 'academic' | 'industry'; user_id: number | null; username: string; email: string; full_name: string; phone: string; position: string; company_id: number | ''; quota_id: number | '' };
type Company = { company_id: number; company_name: string };
type Quota = { quota_id: number; company_id: number; job_title: string; quota_status: string; is_released: boolean };
export type SupervisorAccountsProps = { supervisors: Supervisor[]; companies: Company[]; quotas: Quota[] };
type Props = SupervisorAccountsProps & {
    embedded?: boolean;
    searchQuery?: string;
    supervisorType?: Supervisor['type'];
    onSupervisorTypeChange?: (type: Supervisor['type']) => void;
};

export default function SupervisorAccounts({ supervisors, companies, quotas, embedded = false, searchQuery, supervisorType, onSupervisorTypeChange }: Props) {
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'academic' | 'industry'>('industry');
    const [selected, setSelected] = useState<Supervisor | null>(null);
    const [open, setOpen] = useState(false);
    const activeSearch = searchQuery ?? search;
    const activeType = supervisorType ?? type;
    const filtered = supervisors.filter((supervisor) => supervisor.type === activeType && [supervisor.full_name, supervisor.username, supervisor.email].join(' ').toLowerCase().includes(activeSearch.toLowerCase()));
    const columns: ColumnDef<Supervisor>[] = [
        { accessorKey: 'full_name', header: 'Full Name' },
        { accessorKey: 'email', header: 'Email Address' },
        ...(activeType === 'industry' ? [
            {
                id: 'company',
                header: 'Assigned Company',
                cell: ({ row }) => companies.find((company) => Number(company.company_id) === Number(row.original.company_id))?.company_name ?? 'Not assigned',
            },
            {
                id: 'position',
                header: 'Job Position',
                cell: ({ row }) => quotas.find((quota) => Number(quota.quota_id) === Number(row.original.quota_id))?.job_title ?? (row.original.position || 'Not assigned'),
            },
        ] satisfies ColumnDef<Supervisor>[] : []),
        {
            accessorKey: 'username',
            header: 'Username',
            cell: ({ row }) => row.original.username || 'No login linked',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => row.original.phone || 'Not provided',
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shadow-sm"
                        aria-label={`Edit ${row.original.full_name}`}
                        onClick={() => { setSelected(row.original); setOpen(true); }}
                    >
                        <Pencil className="size-3.5" />
                        Edit
                    </Button>
                </div>
            ),
        },
    ];

    return <>
        <section className="space-y-6">
            {!embedded && <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-sato text-3xl font-bold">Supervisor Accounts & Assignments</h1><p className="mt-1 text-sm text-muted-foreground">Manage Academic and Industry Supervisor accounts and assignments.</p></div><Button size="sm" className="gap-1.5" onClick={() => { setSelected(null); setOpen(true); }}><Plus className="size-4" />Add supervisor</Button></header>}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex flex-wrap gap-1 rounded-lg border bg-white p-1">{(['industry', 'academic'] as const).map((role) => <Button key={role} size="sm" variant={activeType === role ? 'default' : 'ghost'} onClick={() => onSupervisorTypeChange ? onSupervisorTypeChange(role) : setType(role)}>{role === 'industry' ? 'Industry' : 'Academic'} Supervisors ({supervisors.filter((supervisor) => supervisor.type === role).length})</Button>)}</div>
                {searchQuery === undefined && <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input aria-label="Search supervisors" placeholder="Search name, username or email…" className="pl-9 shadow-none" value={search} onChange={(event) => setSearch(event.target.value)} /></div>}
            </div>
            <div className="rounded-xl bg-white">
                <DataTable key={activeType} columns={columns} data={filtered} />
            </div>
        </section>
        <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]"><DialogHeader><DialogTitle>{selected ? 'Edit Supervisor' : 'Add Supervisor'}</DialogTitle><DialogDescription>{selected ? 'Update this supervisor’s account and assignment.' : 'Create a new Academic or Industry Supervisor account.'}</DialogDescription></DialogHeader>{open && <SupervisorForm key={selected ? selected.type + selected.id : 'new-' + activeType} supervisor={selected ?? undefined} initialType={activeType} companies={companies} quotas={quotas} close={() => setOpen(false)} />}</DialogContent></Dialog>
    </>;
}

export function SupervisorForm({ supervisor, initialType = 'industry', companies, quotas, close }: { supervisor?: Supervisor; initialType?: Supervisor['type']; companies: Company[]; quotas: Quota[]; close: () => void }) {
    const form = useForm({ type: supervisor?.type ?? initialType, username: supervisor?.username ?? '', email: supervisor?.email ?? '', password: '', full_name: supervisor?.full_name ?? '', phone: supervisor?.phone ?? '', position: supervisor?.position ?? '', company_id: String(supervisor?.company_id ?? (companies.length === 1 ? companies[0].company_id : '')), quota_id: String(supervisor?.quota_id ?? '') });
    const selectClass = 'h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm';
    return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const options = { preserveScroll: true, onSuccess: close }; if (supervisor) form.put(route('admin.supervisors.update', { type: supervisor.type, id: supervisor.id }), options); else form.post(route('admin.supervisors.store'), options); }}>
        <Field label="Supervisor role"><select className={selectClass} disabled={Boolean(supervisor)} value={form.data.type} onChange={(event) => form.setData('type', event.target.value as Supervisor['type'])}><option value="industry">Industry Supervisor</option><option value="academic">Academic Supervisor</option></select></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Full Name"><Input required value={form.data.full_name} onChange={(event) => form.setData('full_name', event.target.value)} /></Field><Field label="Username"><Input required value={form.data.username} onChange={(event) => form.setData('username', event.target.value)} /></Field><Field label="Email"><Input required type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} /></Field><Field label="Phone"><Input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} /></Field></div>
        <Field label={supervisor?.user_id ? 'New Password (optional)' : 'Password'}><Input type="password" autoComplete="new-password" required={!supervisor?.user_id} minLength={8} value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} /></Field>
        {form.data.type === 'industry' && <><Field label="Company"><select required className={selectClass} value={form.data.company_id} onChange={(event) => { form.setData('company_id', event.target.value); form.setData('quota_id', ''); }}><option value="">Select company</option>{companies.map((company) => <option key={company.company_id} value={company.company_id}>{company.company_name}</option>)}</select></Field><Field label="Select an approved job position"><select className={selectClass} value={form.data.quota_id} onChange={(event) => form.setData('quota_id', event.target.value)}><option value="">No position assigned</option>{quotas.filter((quota) => Number(quota.company_id) === Number(form.data.company_id)).map((quota) => <option key={quota.quota_id} value={quota.quota_id} disabled={!(quota.quota_status === 'Approved' && quota.is_released) && quota.quota_id !== supervisor?.quota_id}>{quota.job_title}{quota.quota_status === 'Approved' && quota.is_released ? '' : ' (closed)'}</option>)}</select></Field><Field label="Position / job title"><Input value={form.data.position} onChange={(event) => form.setData('position', event.target.value)} /></Field></>}
        <Errors errors={form.errors} /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button disabled={form.processing}>{form.processing ? 'Saving…' : supervisor ? 'Save changes' : 'Create account'}</Button></div>
    </form>;
}
