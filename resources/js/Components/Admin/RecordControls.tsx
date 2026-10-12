import { useEffect, type ReactNode } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { ClipboardCheck } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';

export const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500';
export const buttonClass = 'inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50';
export const linkClass = 'inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50';

export function RecordFeedback() {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);
    return null;
}

export function Errors({ errors }: { errors: Record<string, string | undefined> }) {
    const messages = Array.from(new Set(Object.values(errors).filter(Boolean)));
    return messages.length ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{messages.map((message) => <p key={message}>{message}</p>)}</div> : null;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return <label className="block space-y-2 text-sm font-semibold text-slate-700"><span>{label}</span>{children}</label>;
}

export function RecordPanel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-700 ring-1 ring-blue-100"><ClipboardCheck size={20} /></span><h2 className="text-lg font-bold text-slate-900">{title}</h2></div>{action}
        </div>{children}
    </section>;
}

export function ConfirmAction({ url, label, description, disabled = false, method = 'post' }: { url: string; label: string; description: string; disabled?: boolean; method?: 'post' | 'delete' }) {
    const form = useForm({});
    return <div className="space-y-2">
        <AlertDialog>
            <AlertDialogTrigger asChild><button type="button" disabled={disabled || form.processing} className={linkClass + ' disabled:cursor-not-allowed disabled:opacity-50'}>{form.processing ? 'Saving…' : label}</button></AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{label}?</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => form[method](url, { preserveScroll: true })}>Confirm</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog><Errors errors={form.errors} />
    </div>;
}

export function StatusEditor({ url, field = 'status', value, label, options }: { url: string; field?: 'status' | 'decision' | 'monitoring_status'; value: string; label: string; options: { value: string; disabled?: boolean }[] }) {
    const form = useForm({ value });
    return <form onSubmit={(event) => { event.preventDefault(); form.transform((data) => ({ [field]: data.value })); form.put(url, { preserveScroll: true }); }} className="space-y-3">
        <Field label={label}><select className={inputClass} value={form.data.value} onChange={(event) => form.setData('value', event.target.value)}><option value="" disabled>Select a status</option>{options.map((option) => <option key={option.value} disabled={option.disabled} value={option.value}>{option.value}</option>)}</select></Field>
        <Errors errors={form.errors} /><button className={buttonClass} disabled={form.processing || !form.data.value || options.find((option) => option.value === form.data.value)?.disabled}>Save decision</button>
    </form>;
}
