import { useId, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Errors } from './RecordControls';

export default function ReopenLogbookButton({ url }: { url: string }) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const form = useForm({ reason: '', confirmed: false });

    return <Dialog open={open} onOpenChange={(value) => {
        if (form.processing) return;
        setOpen(value);
        if (value) { form.reset(); form.clearErrors(); }
    }}>
        <DialogTrigger asChild><Button type="button" variant="outline">Reopen week</Button></DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
            <DialogHeader>
                <DialogTitle>Reopen logbook week?</DialogTitle>
                <DialogDescription>The student will correct and resubmit this week for approval. Any final completion decision returns to Pending Evaluation and must be confirmed again by PB Supervisor.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(event) => {
                event.preventDefault();
                if (form.processing || !form.data.reason.trim() || !form.data.confirmed) return;
                form.post(url, { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } });
            }}>
                <p className="text-sm leading-6 text-slate-600">Report marks, supervisor evaluations and company confirmation will be retained. The reason and previous completion decision will be kept in history.</p>
                <div>
                    <label htmlFor={`${id}-reason`} className="mb-2 block text-sm font-medium text-slate-700">Reason for reopening</label>
                    <textarea id={`${id}-reason`} required maxLength={2000} rows={3} className="ui-textarea" value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} placeholder="Explain what the student needs to correct" />
                </div>
                <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                    <input type="checkbox" required checked={form.data.confirmed} onChange={(event) => form.setData('confirmed', event.target.checked)} className="mt-1" />
                    <span>I understand that completion must be confirmed again after this correction is approved.</span>
                </label>
                <Errors errors={form.errors} />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" disabled={form.processing} onClick={() => setOpen(false)}>Cancel</Button>
                    <Button disabled={form.processing || !form.data.reason.trim() || !form.data.confirmed}>{form.processing ? 'Reopening…' : 'Confirm reopening'}</Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>;
}
