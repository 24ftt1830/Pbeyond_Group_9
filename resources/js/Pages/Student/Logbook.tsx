import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, LockKeyhole, Paperclip } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Errors, RecordFeedback, buttonClass, linkClass } from '@/Components/Admin/RecordControls';
import { DailyEntry, statusLabels } from './LogbookSubmission';

interface WeeklySubmission { id: number; week_start: string; week_end: string; status: string; date_change_review_required?: boolean; supervisor_feedback?: string | null; submitted_at?: string | null; reviewed_at?: string | null; }
interface Props { entries: Record<string, DailyEntry>; weeklySubmissions: Record<string, WeeklySubmission>; isRecruited: boolean; internshipPeriod?: { start_date: string; end_date: string } | null; today: string; canExport: boolean; attendance: { total_days: number; elapsed_days: number; recorded_days: number; }; unlockedWeekStart?: string | null; }
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const displayDate = (date: string) => new Date(`${date.substring(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const reviewed = (status?: string) => ['approved', 'reviewed'].includes(status ?? '');
const weeklyLabel = (submission?: WeeklySubmission) => submission?.date_change_review_required ? 'Industry review required after date change' : reviewed(submission?.status) ? 'Approved' : ['pending_fix', 'revision', 'needs_revision'].includes(submission?.status ?? '') ? 'Corrections required' : submission?.status ? 'Awaiting Industry review' : 'Not submitted';

export default function Logbook({ entries = {}, weeklySubmissions = {}, isRecruited, internshipPeriod, today, canExport, attendance, unlockedWeekStart = null }: Props) {
    const weeks = useMemo(() => {
        if (!isRecruited || !internshipPeriod) return [];
        const cursor = new Date(`${internshipPeriod.start_date}T00:00:00`);
        cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
        const result: { start: string; days: string[] }[] = [];
        while (dateKey(cursor) <= internshipPeriod.end_date) {
            const start = dateKey(cursor); const days: string[] = [];
            for (let day = 0; day < 7; day++) { const key = dateKey(cursor); if (key >= internshipPeriod.start_date && key <= internshipPeriod.end_date) days.push(key); cursor.setDate(cursor.getDate() + 1); }
            result.push({ start, days });
        }
        return result;
    }, [isRecruited, internshipPeriod?.start_date, internshipPeriod?.end_date]);
    const initialIndex = () => {
        const requested = new URLSearchParams(window.location.search).get('week') ?? today;
        const match = weeks.findIndex(week => requested >= week.start && requested <= week.days[week.days.length - 1]);
        if (match >= 0) return match;
        return weeks.length && requested > weeks[weeks.length - 1].days.slice(-1)[0] ? weeks.length - 1 : 0;
    };
    const [selectedIndex, setSelectedIndex] = useState(initialIndex);
    const index = Math.min(Math.max(selectedIndex, 0), Math.max(0, weeks.length - 1));
    const week = weeks[index]; const submission = weeklySubmissions[week?.start];
    const locked = Boolean(submission && !['pending_fix', 'revision', 'needs_revision'].includes(submission.status));
    const canEditWeek = Boolean(week && week.start === unlockedWeekStart);
    const blockedByEarlierWeek = Boolean(week && !canEditWeek && !locked);
    const expectedDates = week?.days ?? [];
    const complete = expectedDates.length > 0 && expectedDates.every(day => entries[day] && day <= today);
    const form = useForm({ week_start: '' });

    return <AuthenticatedLayout><Head title="Logbook" /><RecordFeedback /><main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Logbook</h1><p className="mt-1 text-sm text-slate-500">Record your internship days and submit each week to your Industry Supervisor.</p>{internshipPeriod && <p className="mt-2 text-xs text-slate-500">Internship period: {displayDate(internshipPeriod.start_date)} – {displayDate(internshipPeriod.end_date)}</p>}</div>{canExport && <a href={route('student.logbook.export')} className={linkClass}><Download size={16} className="mr-2" /> Download CSV</a>}</header>
        <Errors errors={form.errors} />
        {!weeks.length ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{!isRecruited ? 'Your logbook becomes available after recruitment and internship dates are assigned.' : 'Ask Company HR to set your internship dates.'}</div> : <>
            <nav aria-label="Internship weeks" className="space-y-4"><div className="flex items-center justify-between gap-4"><button className={linkClass} aria-label="Previous week" disabled={index === 0} onClick={() => setSelectedIndex(index - 1)}><ChevronLeft size={18} /></button><div className="text-center"><p className="text-sm font-semibold text-slate-900">Week {index + 1} of {weeks.length}</p><p className="mt-1 text-xs text-slate-500">{displayDate(week.days[0])} – {displayDate(week.days[week.days.length - 1])}</p></div><button className={linkClass} aria-label="Next week" disabled={index === weeks.length - 1} onClick={() => setSelectedIndex(index + 1)}><ChevronRight size={18} /></button></div><div className="flex overflow-x-auto border-b border-slate-200">{weeks.slice(Math.max(0, index - 2), Math.max(0, index - 2) + 5).map(item => { const number = weeks.indexOf(item); return <button key={item.start} onClick={() => setSelectedIndex(number)} className={`flex-1 whitespace-nowrap border-b-2 px-5 py-3 text-sm ${number === index ? 'border-blue-600 font-medium text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>Week {number + 1}</button>; })}</div></nav>
            <div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${reviewed(submission?.status) && !submission?.date_change_review_required ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{weeklyLabel(submission)}</span><p className="text-xs text-slate-500">{expectedDates.filter(day => entries[day]).length} / {expectedDates.length} days recorded</p></div>
            {submission?.date_change_review_required && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Your Industry Supervisor needs to review this saved week after the internship date change. Your logbook has been kept.</p>}
            {submission?.supervisor_feedback && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="mb-1 font-semibold">Industry Supervisor feedback</p>{submission.supervisor_feedback}</div>}
            {blockedByEarlierWeek && <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><LockKeyhole size={17} className="mt-0.5 shrink-0" /><p>This week is locked until your Industry Supervisor approves every earlier week.</p></div>}
            <section className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{week.days.map(day => { const entry = entries[day]; const future = day > today; return <details key={day} className="group"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 sm:px-5"><div><p className="text-sm font-semibold text-slate-900">{new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long' })}</p><p className="mt-1 text-xs text-slate-500">{displayDate(day)}</p></div><div className="flex items-center gap-3"><span className="text-xs text-slate-500">{future ? 'Future date' : entry ? statusLabels[entry.status] ?? statusLabels.permission : 'Not recorded'}</span>{(locked || blockedByEarlierWeek) && <LockKeyhole size={14} className="text-slate-400" />}<ChevronRight size={16} className="text-slate-400 transition-transform group-open:rotate-90" /></div></summary><div className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-4 text-sm sm:px-5">{entry ? <><div className="grid gap-4 sm:grid-cols-2">{[['Activities / notes', entry.description], ['Learning outcomes', entry.learning_outcomes], ['Issues', entry.issues]].map(([label, text]) => text && <div key={label}><p className="mb-1 text-xs font-medium text-slate-500">{label}</p><p className="whitespace-pre-wrap text-slate-700">{text}</p></div>)}</div><div className="flex flex-wrap gap-3">{entry.attachments?.map(file => <a key={file.id} href={file.url} className="inline-flex items-center gap-1 text-xs text-blue-700 underline"><Paperclip size={13} />{file.name}</a>)}</div></> : <p className="text-slate-500">{future ? 'You can record this day once it arrives.' : 'No log has been saved for this day.'}</p>}{!future && !locked && canEditWeek && <Link href={route('student.logbook.create', { date: day })} className={linkClass}>{entry ? 'Edit daily log' : 'Record daily log'}</Link>}</div></details>; })}</section>
            <div className="flex flex-wrap items-center justify-between gap-4"><p className="max-w-xl text-xs text-slate-500">Complete every internship day before submitting. The next week unlocks after your Industry Supervisor approves this week.</p>{!locked && canEditWeek && <button disabled={!complete || form.processing} className={buttonClass} onClick={() => { form.transform(() => ({ week_start: week.start })); form.post(route('student.logbook.submit-week'), { preserveScroll: true }); }}>{form.processing ? 'Submitting…' : submission ? 'Resubmit week' : 'Submit week'}</button>}</div>
        </>}
    </main></AuthenticatedLayout>;
}
