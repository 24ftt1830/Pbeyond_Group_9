import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Errors, RecordFeedback, ConfirmAction, inputClass, buttonClass, linkClass } from '@/Components/Admin/RecordControls';

export interface Attachment { id: string; name: string; mime: string; size: number; url: string; }
export interface DailyEntry { id: number; status: string; description: string | null; learning_outcomes: string | null; issues: string | null; attachments: Attachment[]; legacy_permission?: boolean; }
export interface DayProps { date: string; entry?: DailyEntry | null; weekSubmission?: { supervisor_feedback?: string | null; } | null; permissionMode?: boolean; }
export const statusLabels: Record<string, string> = { working: 'Work day', permission: 'Absent with permission/MC', absent: 'Absent', holiday: 'Public Holiday' };
type FormFields = { date: string; status: string; description: string; learning_outcomes: string; issues: string; attachments: File[]; remove_attachment_ids: string[]; };

export default function LogbookSubmission({ date, entry, weekSubmission, permissionMode = false }: DayProps) {
    const [fileKey, setFileKey] = useState(0);
    const form = useForm<FormFields>({ date, status: permissionMode ? 'permission' : (entry?.status === 'off' ? 'permission' : entry?.status ?? 'working'), description: entry?.description ?? '', learning_outcomes: entry?.learning_outcomes ?? '', issues: entry?.issues ?? '', attachments: [], remove_attachment_ids: [] });
    const formatted = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const permissionNeedsUpload = form.data.status === 'permission' && !permissionMode;

    return <AuthenticatedLayout><Head title={permissionMode ? 'Permission / MC evidence' : 'Daily logbook'} /><RecordFeedback />
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <header><Link href={route('student.logbook', { week: date })} className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} /> Back to logbook</Link><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{permissionMode ? 'Permission / MC evidence' : 'Daily logbook'}</h1><p className="mt-1 text-sm text-slate-500">{formatted}</p></header>
            {weekSubmission?.supervisor_feedback && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="mb-1 font-semibold">Industry Supervisor feedback</p>{weekSubmission.supervisor_feedback}</div>}
            <form onSubmit={event => { event.preventDefault(); if (form.data.remove_attachment_ids.length && !window.confirm('Remove the selected attachments when saving?')) return; form.post(route('student.logbook.store'), { forceFormData: true, preserveScroll: true }); }} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <Errors errors={form.errors} />
                <div><label htmlFor="day-status" className="mb-2 block text-sm font-medium text-slate-700">Daily status</label><select id="day-status" className={inputClass} value={form.data.status} disabled={permissionMode} onChange={event => form.setData('status', event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                {permissionNeedsUpload && <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700"><p className="mb-3">Permission / MC requires supporting evidence. Upload it on the evidence page.</p><Link href={route('student.logbook.attachments', { date })} className={linkClass}><Paperclip size={16} className="mr-2" /> Open evidence upload</Link></div>}
                <div className="grid gap-5 lg:grid-cols-2"><div><label htmlFor="activities" className="mb-2 block text-sm font-medium text-slate-700">{form.data.status === 'working' ? 'Activities' : 'Notes (optional)'}</label><textarea id="activities" className={inputClass} rows={5} value={form.data.description} required={form.data.status === 'working'} onChange={event => form.setData('description', event.target.value)} /></div><div><label htmlFor="outcomes" className="mb-2 block text-sm font-medium text-slate-700">Learning outcomes{form.data.status === 'working' ? '' : ' (optional)'}</label><textarea id="outcomes" className={inputClass} rows={5} value={form.data.learning_outcomes} required={form.data.status === 'working'} onChange={event => form.setData('learning_outcomes', event.target.value)} /></div></div>
                <div><label htmlFor="issues" className="mb-2 block text-sm font-medium text-slate-700">Issues (optional)</label><textarea id="issues" rows={3} className={inputClass} value={form.data.issues} onChange={event => form.setData('issues', event.target.value)} /></div>
                <section className="space-y-3 border-t border-slate-100 pt-5"><div><h2 className="text-sm font-semibold text-slate-900">{permissionMode ? 'Permission / MC attachments' : 'Attachments (optional)'}</h2><p className="mt-1 text-xs text-slate-500">Up to 5 files, 10 MB each. Images, PDF, Word, Excel, CSV or text. Files are private.</p></div>
                    {(entry?.attachments ?? []).map(file => <div key={file.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"><a href={file.url} className="inline-flex items-center gap-2 text-blue-700 underline"><Paperclip size={15} />{file.name}</a><label className="inline-flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={form.data.remove_attachment_ids.includes(file.id)} onChange={event => form.setData('remove_attachment_ids', event.target.checked ? [...form.data.remove_attachment_ids, file.id] : form.data.remove_attachment_ids.filter(id => id !== file.id))} /> Remove when saved</label></div>)}
                    <input key={fileKey} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" className="block w-full rounded-lg border border-slate-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm" onChange={event => form.setData('attachments', Array.from(event.target.files ?? []))} />
                    {form.data.attachments.length > 0 && <button type="button" className="text-xs text-slate-500 underline" onClick={() => { form.setData('attachments', []); setFileKey(value => value + 1); }}>Clear selected files</button>}
                    {entry?.legacy_permission && <p className="text-xs text-slate-500">Supporting evidence is optional for this existing entry.</p>}
                </section>
                {form.progress && <p role="status" className="text-sm text-slate-500">Uploading {form.progress.percentage}%</p>}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><div>{entry && <ConfirmAction url={route('student.logbook.destroy', date)} method="delete" label="Delete daily log" description="This removes this day's entry and attachments. You will need to complete it again before submitting the week." disabled={form.processing} />}</div><div className="flex flex-wrap gap-3"><Link href={route('student.logbook', { week: date })} className={linkClass}>Cancel</Link><button className={buttonClass} disabled={form.processing || permissionNeedsUpload}>{form.processing ? 'Saving…' : 'Save daily log'}</button></div></div>
            </form>
        </main>
    </AuthenticatedLayout>;
}
