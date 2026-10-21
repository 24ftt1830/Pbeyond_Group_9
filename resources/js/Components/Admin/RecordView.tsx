import { useState, type ReactNode } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Errors, Field, inputClass } from './RecordControls';

export function SectionCard({ title, icon, action, children }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode }) {
    return <section className="ui-card overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">{icon}</span>
                <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{title}</h2>
            </div>
            {action}
        </div>
        {children}
    </section>;
}

export function InfoItem({ label, value, icon }: { label: string; value?: string | number | null; icon?: ReactNode }) {
    return <div className="min-h-[72px] rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{icon}{label}</p>
        <p className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800">{display(value)}</p>
    </div>;
}

export function EmptyState({ text }: { text: string }) {
    return <p className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">{text}</p>;
}

export function RecordTabs({ tabs, value, onChange, label }: { tabs: string[]; value: string; onChange: (value: string) => void; label: string }) {
    return <nav aria-label={label} className={'grid w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm ' + (tabs.length > 4 ? 'xl:grid-cols-5' : tabs.length === 3 ? 'lg:grid-cols-3' : 'xl:grid-cols-4')}>
        {tabs.map((tab) => <button key={tab} type="button" aria-pressed={value === tab} onClick={() => onChange(tab)} className={'ui-tab ' + ('flex min-h-10 w-full items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-semibold leading-5 transition ' + (value === tab ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'))} >{tab}</button>)}
    </nav>;
}

export function EditDialog({ label = 'Edit', title, description, children, create = false, disabled = false }: { label?: string; title: string; description: string; children: (close: () => void) => ReactNode; create?: boolean; disabled?: boolean }) {
    const [open, setOpen] = useState(false);
    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button type="button" variant={create ? 'default' : 'outline'} size="sm" disabled={disabled} className="gap-1.5">{create ? <Plus className="size-4" /> : <Pencil className="size-4" />}{label}</Button></DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
            {open && children(() => setOpen(false))}
        </DialogContent>
    </Dialog>;
}

export function DecisionForm({ url, field = 'status', value, label, options, close }: { url: string; field?: 'status' | 'decision' | 'monitoring_status'; value: string; label: string; options: { value: string; disabled?: boolean }[]; close: () => void }) {
    const form = useForm({ value });
    return <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        form.transform((data) => ({ [field]: data.value }));
        form.put(url, { preserveScroll: true, onSuccess: close });
    }}>
        <Field label={label}><select className={'ui-field ' + (inputClass)}  value={form.data.value} onChange={(event) => form.setData('value', event.target.value)}><option value="" disabled>Select a status</option>{options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.value}</option>)}</select></Field>
        <Errors errors={form.errors} />
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button disabled={form.processing || !form.data.value || options.find((option) => option.value === form.data.value)?.disabled}>{form.processing ? 'Saving…' : 'Save changes'}</Button></div>
    </form>;
}

export function display(value?: string | number | null) {
    return value === null || value === undefined || value === '' ? 'Not provided' : String(value);
}

export function formatDate(value?: string | null) {
    if (!value) return 'Not provided';
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
}

export function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return null;
    return `${start ? formatDate(start) : 'Start date not provided'} – ${end ? formatDate(end) : 'Present'}`;
}

export function statusTone(status: string) {
    if (['Completed', 'Confirmed', 'Submitted', 'Approved', 'approved', 'reviewed', 'On Track'].includes(status)) return 'ui-badge-success';
    if (['Incomplete', 'Changes Required', 'At Risk', 'Declined', 'Rejected'].includes(status)) return 'ui-badge-danger';
    return 'ui-badge-warning';
}
