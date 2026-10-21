import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { RecordFeedback, linkClass } from '@/Components/Admin/RecordControls';
import LogbookTestingNotice from '@/Components/LogbookTestingNotice';
import { attendanceBasisLabel, attendanceLabel, type AttendanceSummary } from '@/lib/attendance';

interface Submission {
    id: number;
    week_start: string;
    week_end: string;
    status: string;
    date_change_review_required?: boolean;
}
interface Props {
    student: { student_id: number; full_name: string; pb_student_code: string };
    internshipPeriod?: { start_date: string; end_date: string } | null;
    weeklySubmissions?: Submission[];
    missingWeeks?: { week_start: string; week_end: string }[];
    today: string;
    canReview?: boolean;
    viewer?: 'industry' | 'academic';
    allowFutureDates?: boolean;
    attendance?: AttendanceSummary;
}
interface WeekRow {
    key: string;
    number: number | null;
    start: string;
    end: string;
    submission?: Submission;
    missing: boolean;
    historical: boolean;
}
const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dateLabel = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const approved = (submission?: Submission) => Boolean(submission && !submission.date_change_review_required && ['approved', 'reviewed'].includes(submission.status));
const needsReview = (submission?: Submission) => Boolean(submission && (submission.date_change_review_required || ['submitted', 'pending'].includes(submission.status)));
const needsCorrections = (submission?: Submission) => Boolean(submission && !submission.date_change_review_required && ['pending_fix', 'revision', 'needs_revision'].includes(submission.status));
const filters = [{ value: 'all', label: 'All weeks' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'corrections', label: 'Corrections' }, { value: 'missing', label: 'Missing' }];

export default function LogbookStudent({ student, internshipPeriod, weeklySubmissions = [], missingWeeks = [], today, canReview = false, viewer = 'academic', allowFutureDates = false, attendance }: Props) {
    const [filter, setFilter] = useState('all');
    const rolePrefix = viewer === 'industry' ? 'industry-supervisor' : 'academic-supervisor';
    const weeks = useMemo(() => {
        const submissions = new Map(weeklySubmissions.map(week => [week.week_start.slice(0, 10), week]));
        const missing = new Set(missingWeeks.map(week => week.week_start.slice(0, 10)));
        const rows: WeekRow[] = [];
        if (internshipPeriod) {
            const cursor = new Date(`${internshipPeriod.start_date}T00:00:00`);
            cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
            while (dayKey(cursor) <= internshipPeriod.end_date) {
                const key = dayKey(cursor);
                const end = new Date(cursor);
                end.setDate(end.getDate() + 6);
                rows.push({ key, number: rows.length + 1, start: key < internshipPeriod.start_date ? internshipPeriod.start_date : key, end: dayKey(end) > internshipPeriod.end_date ? internshipPeriod.end_date : dayKey(end), submission: submissions.get(key), missing: missing.has(key), historical: false });
                submissions.delete(key);
                cursor.setDate(cursor.getDate() + 7);
            }
        }
        submissions.forEach((submission, key) => rows.push({ key, number: null, start: key, end: submission.week_end.slice(0, 10), submission, missing: false, historical: Boolean(internshipPeriod) }));
        return rows.sort((a, b) => a.key.localeCompare(b.key));
    }, [internshipPeriod?.start_date, internshipPeriod?.end_date, weeklySubmissions, missingWeeks]);
    const visibleWeeks = weeks.filter(week => filter === 'all' || (filter === 'pending' && needsReview(week.submission)) || (filter === 'approved' && approved(week.submission)) || (filter === 'corrections' && needsCorrections(week.submission)) || (filter === 'missing' && week.missing));
    const pendingCount = weeks.filter(week => needsReview(week.submission)).length;
    const approvedCount = weeks.filter(week => approved(week.submission)).length;
    const status = (week: WeekRow) => {
        if (week.submission?.date_change_review_required) return { label: 'Date change review', tone: 'ui-badge-warning' };
        if (approved(week.submission)) return { label: 'Approved', tone: 'ui-badge-success' };
        if (needsCorrections(week.submission)) return { label: 'Corrections required', tone: 'ui-badge-danger' };
        if (needsReview(week.submission)) return { label: canReview ? 'Awaiting review' : 'Awaiting Industry review', tone: 'ui-badge-warning' };
        if (week.missing) return { label: 'Missing', tone: 'ui-badge-danger' };
        return { label: !week.submission && week.start > today ? 'Upcoming' : 'Not submitted', tone: 'ui-badge-neutral' };
    };

    return <AuthenticatedLayout><Head title={`${student.full_name} · Logbooks`} /><RecordFeedback />
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <header className="space-y-4">
                <BackButton href={route(`${rolePrefix}.logbook`)}>Back to students</BackButton>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{student.full_name}</h1><p className="mt-1 text-sm text-slate-500">{student.pb_student_code} · Logbooks</p>{internshipPeriod && <p className="mt-2 text-xs text-slate-500">Internship: {dateLabel(internshipPeriod.start_date)} – {dateLabel(internshipPeriod.end_date)}</p>}</div>
                    {!canReview && <span className="ui-badge ui-badge-neutral">View only</span>}
                </div>
            </header>
            {allowFutureDates && <LogbookTestingNotice />}
            {attendance && <section className="ui-card space-y-1 p-4 text-sm"><p className="font-semibold text-slate-900">Attendance: {attendanceLabel(attendance)}</p><p className="text-xs text-slate-500">{attendance.credited_days} credited / {attendance.recorded_days} approved recorded days · {attendance.elapsed_days} / {attendance.total_days} internship days actually elapsed</p><p className="text-xs text-slate-500">{attendanceBasisLabel(attendance)}</p></section>}
            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-semibold text-slate-900">Weekly logbooks</h2><p className="mt-1 text-sm text-slate-500">{canReview ? 'Open a submitted week to review its daily entries.' : 'View weekly entries and Industry Supervisor feedback.'}</p></div><div className="flex flex-wrap gap-2"><span className="ui-badge ui-badge-warning">{pendingCount} pending</span><span className="ui-badge ui-badge-success">{approvedCount} approved</span></div></div>
                <div className="max-w-full overflow-x-auto"><nav aria-label="Filter this student's logbooks" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">{filters.map(item => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className="ui-tab h-9 shrink-0 whitespace-nowrap px-3 py-1.5 text-xs">{item.label}</button>)}</nav></div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="hidden grid-cols-[5rem_1fr_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-500 sm:grid"><span>Week</span><span>Dates</span><span>Status</span><span>Action</span></div>
                    <div className="divide-y divide-slate-100">{visibleWeeks.map(week => { const currentStatus = status(week); return <div key={week.key} className="grid items-center gap-3 px-5 py-4 sm:grid-cols-[5rem_1fr_1fr_auto]">
                        <p className="text-sm font-semibold text-slate-900">{week.number === null ? 'Saved week' : `Week ${week.number}`}</p>
                        <div><p className="text-sm text-slate-600">{dateLabel(week.start)} – {dateLabel(week.end)}</p>{week.historical && <p className="mt-1 text-xs text-slate-500">Previous internship dates</p>}</div>
                        <span className={`ui-badge w-fit ${currentStatus.tone}`}>{currentStatus.label}</span>
                        {week.submission ? <Link href={route(`${rolePrefix}.logbook.review`, week.submission.id)} className={linkClass + ' w-fit'}>{canReview && needsReview(week.submission) ? 'Review' : 'View'}<ChevronRight size={14} /></Link> : <span className="text-xs text-slate-500">Awaiting submission</span>}
                    </div>; })}</div>
                    {!visibleWeeks.length && <div className="px-6 py-8 text-center"><BookOpen size={24} className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-medium text-slate-700">{weeks.length ? 'No weeks match this filter' : 'No logbook weeks yet'}</p><p className="mt-1 text-xs text-slate-500">{weeks.length ? 'Choose another filter to see this student’s weeks.' : 'Weeks appear after internship dates are assigned.'}</p></div>}
                </div>
                <p className="text-xs text-slate-500">Weeks are ordered from earliest to latest. First and last weeks show only the dates within the internship period.</p>
            </section>
        </main>
    </AuthenticatedLayout>;
}
