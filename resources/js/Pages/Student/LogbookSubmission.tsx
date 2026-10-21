import { confirmAction } from '@/lib/confirm-action';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { ArrowLeft, Paperclip, RefreshCw } from 'lucide-react';
import { Errors, RecordFeedback, inputClass, buttonClass, linkClass } from '@/Components/Admin/RecordControls';
import LogbookTestingNotice from '@/Components/LogbookTestingNotice';

export interface Attachment { id: string; name: string; mime: string; size: number; url: string; }
export interface DailyEntry { id: number; status: string; description: string | null; learning_outcomes: string | null; issues: string | null; attachments: Attachment[]; legacy_permission?: boolean; }
export interface DayProps { date: string; entry?: DailyEntry | null; weekSubmission?: { supervisor_feedback?: string | null; } | null; initialStatus?: string | null; allowFutureDates?: boolean; }
export const statusLabels: Record<string, string> = { working: 'Work day', permission: 'Absent with permission/MC', absent: 'Absent', holiday: 'Public Holiday' };
type FormFields = { date: string; status: string; description: string; learning_outcomes: string; issues: string; attachments: File[]; };

export default function LogbookSubmission({ date, entry, weekSubmission, initialStatus, allowFutureDates = false }: DayProps) {
    const [fileKey, setFileKey] = useState(0);
    const [replacements, setReplacements] = useState<Record<string, File>>({});
    const replacementInputs = useRef<Record<string, HTMLInputElement | null>>({});
    const form = useForm<FormFields>({ date, status: initialStatus ?? (entry?.status === 'off' ? 'permission' : entry?.status ?? 'working'), description: entry?.description ?? '', learning_outcomes: entry?.learning_outcomes ?? '', issues: entry?.issues ?? '', attachments: [] });
    const formatted = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const isPermission = form.data.status === 'permission';
    const isWorking = form.data.status === 'working';
    const isNone = form.data.status === 'none';
    const canAttach = isWorking || isPermission;

    const saveDay = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (form.processing) return;
        const removeIds = canAttach ? Object.keys(replacements) : (entry?.attachments ?? []).map(file => file.id);
        if (isNone && entry) {
            if (!(await confirmAction('Clear this daily log and its attachments? The day will return to Not recorded and must be completed again before submitting the week.', { title: 'Clear daily log?', confirmLabel: 'Clear day', destructive: true }))) return;
        } else if (!canAttach && removeIds.length && !(await confirmAction('Changing the day type will remove its saved attachments. Save this change?', { title: 'Change daily status?', confirmLabel: 'Save changes', destructive: true }))) return;
        form.transform(data => isNone ? { date: data.date, status: 'none' } : {
            ...data,
            learning_outcomes: isWorking ? data.learning_outcomes : '',
            issues: isWorking ? data.issues : '',
            attachments: canAttach ? [...data.attachments, ...Object.values(replacements)] : [],
            remove_attachment_ids: removeIds,
        });
        form.post(route('student.logbook.store'), { forceFormData: true, preserveScroll: true });
    };

    return <AuthenticatedLayout><Head title={isPermission ? 'Permission / MC evidence' : 'Daily logbook'} /><RecordFeedback />
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <header><Link href={route('student.logbook', { week: date })} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} /> Back to logbook</Link><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{isPermission ? 'Permission / MC evidence' : 'Daily logbook'}</h1><p className="mt-1 text-sm text-slate-500">{formatted}</p></header>
            {allowFutureDates && <LogbookTestingNotice />}
            {weekSubmission?.supervisor_feedback && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="mb-1 font-semibold">Industry Supervisor feedback</p>{weekSubmission.supervisor_feedback}</div>}
            <form onSubmit={saveDay} className="ui-card space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <Errors errors={form.errors} />
                <div><label htmlFor="day-status" className="mb-2 block text-sm font-medium text-slate-700">Daily status</label><select id="day-status" className={inputClass} value={form.data.status} disabled={form.processing} onChange={event => form.setData('status', event.target.value)}><option value="none">None</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                {isNone && <p className="text-sm text-slate-500">Saving None clears this day back to Not recorded.</p>}
                {!isNone && !isWorking && <div><label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">Description (optional)</label><textarea id="description" className="ui-textarea ui-field" rows={4} value={form.data.description} onChange={event => form.setData('description', event.target.value)} /></div>}
                {isWorking && <>
                <div className="grid gap-5 lg:grid-cols-2"><div><label htmlFor="activities" className="mb-2 block text-sm font-medium text-slate-700">{form.data.status === 'working' ? 'Activities' : 'Notes (optional)'}</label><textarea id="activities" className={'ui-textarea ' + (inputClass)}  rows={5} value={form.data.description} required={form.data.status === 'working'} onChange={event => form.setData('description', event.target.value)} /></div><div><label htmlFor="outcomes" className="mb-2 block text-sm font-medium text-slate-700">Learning outcomes{form.data.status === 'working' ? '' : ' (optional)'}</label><textarea id="outcomes" className={'ui-textarea ' + (inputClass)}  rows={5} value={form.data.learning_outcomes} required={form.data.status === 'working'} onChange={event => form.setData('learning_outcomes', event.target.value)} /></div></div>
                <div><label htmlFor="issues" className="mb-2 block text-sm font-medium text-slate-700">Issues (optional)</label><textarea id="issues" rows={3} className={'ui-textarea ' + (inputClass)}  value={form.data.issues} onChange={event => form.setData('issues', event.target.value)} /></div>
                </>}
                {canAttach && <section className="space-y-3 border-t border-slate-100 pt-5"><div><label htmlFor="daily-attachments" className="block text-sm font-semibold text-slate-900">{isPermission ? 'Permission / MC evidence' : 'Attachments (optional)'}</label><p className="mt-1 text-xs text-slate-500">{isPermission && 'Upload your permission letter or medical certificate. '}Up to 5 files, 10 MB each. Images, PDF, Word, Excel, CSV or text. Files are private.</p></div>
                    {(entry?.attachments ?? []).map(file => <div key={file.id} className="space-y-2 rounded-lg border border-slate-200 px-3 py-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <a href={file.url} className="inline-flex min-w-0 items-center gap-2 break-all text-primary underline"><Paperclip size={15} className="shrink-0" />{file.name}</a>
                            <button type="button" disabled={form.processing} onClick={() => replacementInputs.current[file.id]?.click()} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50" aria-label={`Replace ${file.name}`}><RefreshCw size={13} />Replace file</button>
                        </div>
                        <input ref={element => { replacementInputs.current[file.id] = element; }} type="file" className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" aria-label={`Replacement for ${file.name}`} disabled={form.processing} onChange={event => {
                            const replacement = event.currentTarget.files?.[0];
                            if (replacement) setReplacements(current => ({ ...current, [file.id]: replacement }));
                            event.currentTarget.value = '';
                        }} />
                        {replacements[file.id] && <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs">
                            <span className="min-w-0 break-all text-primary">Replacement: {replacements[file.id].name}</span>
                            <button type="button" disabled={form.processing} className="font-medium text-slate-600 underline disabled:opacity-50" onClick={() => setReplacements(current => {
                                const next = { ...current };
                                delete next[file.id];
                                return next;
                            })}>Undo replacement</button>
                        </div>}
                    </div>)}
                    {Object.keys(replacements).length > 0 && <p className="text-xs text-slate-500">Save your daily log to apply the replacement files.</p>}
                    <input id="daily-attachments" key={fileKey} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" disabled={form.processing} className="ui-field block w-full p-3 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm" onChange={event => form.setData('attachments', Array.from(event.target.files ?? []))} />
                    {form.data.attachments.length > 0 && <button type="button" className="text-xs text-slate-500 underline" onClick={() => { form.setData('attachments', []); setFileKey(value => value + 1); }}>Clear selected files</button>}
                    {isPermission && entry?.legacy_permission && <p className="text-xs text-slate-500">Supporting evidence is optional for this existing entry.</p>}
                </section>}
                {form.progress && <p role="status" className="text-sm text-slate-500">Uploading {form.progress.percentage}%</p>}
                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5"><Link href={route('student.logbook', { week: date })} className={linkClass}>Cancel</Link><button className={isNone && entry ? 'ui-button ui-button-danger' : buttonClass} disabled={form.processing}>{form.processing ? 'Saving…' : isNone ? 'Clear day' : 'Save daily log'}</button></div>
            </form>
        </main>
    </AuthenticatedLayout>;
}
