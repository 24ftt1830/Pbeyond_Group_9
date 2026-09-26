import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Flag,
    CheckCircle2,
    Clock3,
    FileText,
    CalendarDays,
    UserRound,
    ChevronRight,
    AlertTriangle,
    Loader2,
} from 'lucide-react';

interface Submission {
    id: number;
    student_id: number;
    week_start: string;
    week_end: string;
    status: string;
    submitted_at: string | null;
    supervisor_feedback?: string | null;
    flagged_entries?: (number | string)[] | null;
}

interface LogbookEntry {
    id?: number;
    date: string;
    status: 'working' | 'off';
    description: string | null;
    learning_outcomes: string | null;
    issues: string | null;
}

interface Props {
    submission: Submission;
    entries: LogbookEntry[];
}

// Helper to prevent UTC timezone shift bugs
function parseLocalDate(dateStr: string) {
    if (!dateStr) return new Date();
    const cleanDateStr = dateStr.split('T')[0];
    const parts = cleanDateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return new Date();
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
}

export default function LogbookReview({ submission, entries }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        status: (submission.status === 'pending_fix' ? 'pending_fix' : 'approved') as 'approved' | 'pending_fix',
        supervisor_feedback: submission.supervisor_feedback || '',
        flagged_entries: (submission.flagged_entries || []) as (number | string)[],
    });

    const getEntryKey = (entry: LogbookEntry, index: number): number | string => 
        entry.id ?? entry.date ?? index;

    const toggleFlagEntry = (key: number | string) => {
        const isCurrentlyFlagged = data.flagged_entries.some((id) => String(id) === String(key));
        
        const nextFlagged = isCurrentlyFlagged
            ? data.flagged_entries.filter((id) => String(id) !== String(key))
            : [...data.flagged_entries, key];

        setData((prev) => ({
            ...prev,
            flagged_entries: nextFlagged,
            // Automatically switch decision based on whether flagged entries exist
            status: nextFlagged.length > 0 ? 'pending_fix' : 'approved',
        }));
    };

    const handleSubmission = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(`/academic-supervisor/logbook/${submission.id}/mark-reviewed`, {
            preserveScroll: true,
            onError: (err) => {
                console.error('Submission failed with errors:', err);
            },
        });
    };

    const workdayCount = entries.filter((e) => e.status === 'working').length;
    const offdayCount = entries.filter((e) => e.status === 'off').length;

    const renderStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending_fix':
            case 'revision':
            case 'needs_revision':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                        <AlertTriangle size={13} />
                        Pending Revision
                    </span>
                );
            case 'approved':
            case 'reviewed':
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 size={13} />
                        Approved
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                        <Clock3 size={13} />
                        {status || 'Pending Review'}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Review Weekly Logbook" />

            <div className="min-h-screen bg-slate-50 text-slate-900">
                {/* Header */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                    <UserRound size={26} />
                                </div>

                                <div>
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl font-bold sm:text-2xl">
                                            Student #{submission.student_id}
                                        </h1>
                                        {renderStatusBadge(submission.status)}
                                    </div>

                                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                                        <span>Student ID: {submission.student_id}</span>
                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={14} />
                                            {parseLocalDate(submission.week_start).toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                            {' – '}
                                            {parseLocalDate(submission.week_end).toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/academic-supervisor/logbook"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                                <FileText size={17} />
                                Back to Submissions
                                <ChevronRight size={15} />
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-7 pb-32 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <p className="text-sm font-medium text-blue-600">
                            Academic Supervisor Portal
                        </p>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight">
                            Weekly Logbook Review
                        </h2>
                    </div>

                    {/* KPI Cards */}
                    <section className="mb-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Total Days Logged</p>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                {entries.length} / 7
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                                {workdayCount} workdays · {offdayCount} offdays
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Current Status</p>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 capitalize">
                                {submission.status.replace('_', ' ') || 'Pending Review'}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Flagged Entries</p>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600">
                                {data.flagged_entries.length} Day(s) Flagged
                            </div>
                        </div>
                    </section>

                    {/* Logbook Entries */}
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">Weekly Entries</h2>

                        <div className="space-y-4">
                            {entries.map((entry, index) => {
                                const entryKey = getEntryKey(entry, index);
                                const isWorkday = entry.status === 'working';
                                const isFlagged = data.flagged_entries.some((id) => String(id) === String(entryKey));
                                const entryDate = parseLocalDate(entry.date);

                                return (
                                    <article
                                        key={entryKey}
                                        className={`overflow-hidden rounded-2xl border transition shadow-sm ${
                                            isFlagged
                                                ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400'
                                                : 'border-slate-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">
                                                        {entryDate.toLocaleDateString(undefined, { weekday: 'long' })}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">{entry.date}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleFlagEntry(entryKey)}
                                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                                        isFlagged
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <Flag size={14} className={isFlagged ? 'fill-amber-600 text-amber-600' : ''} />
                                                    {isFlagged ? 'Flagged for Revision' : 'Flag Issue'}
                                                </button>

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                        isWorkday ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {isWorkday ? 'Workday' : 'Offday'}
                                                </span>
                                            </div>
                                        </div>

                                        {isWorkday ? (
                                            <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0 p-5">
                                                <div>
                                                    <p className="mb-1 text-xs font-bold uppercase text-slate-400">Activities</p>
                                                    <p className="text-sm text-slate-600 whitespace-pre-line">{entry.description || 'None'}</p>
                                                </div>
                                                <div className="md:px-5">
                                                    <p className="mb-1 text-xs font-bold uppercase text-slate-400">Learning Outcomes</p>
                                                    <p className="text-sm text-slate-600 whitespace-pre-line">{entry.learning_outcomes || 'None'}</p>
                                                </div>
                                                <div className="md:px-5">
                                                    <p className="mb-1 text-xs font-bold uppercase text-slate-400">Issues</p>
                                                    <p className="text-sm text-slate-600 whitespace-pre-line">{entry.issues || 'None'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-5 text-sm font-medium text-slate-500">
                                                Non-working day / Holiday logged.
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    {/* Form Section */}
                    <form onSubmit={handleSubmission} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900">
                            Supervisor Decision & Feedback
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Select the review status and leave feedback for the student.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <label
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                                    data.status === 'approved'
                                        ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500'
                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="decision"
                                    value="approved"
                                    checked={data.status === 'approved'}
                                    onChange={() => setData('status', 'approved')}
                                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div>
                                    <span className="block font-semibold text-slate-900">Approve Logbook</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">
                                        Logbook meets expectations and requires no further changes.
                                    </span>
                                </div>
                            </label>

                            <label
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                                    data.status === 'pending_fix'
                                        ? 'border-rose-500 bg-rose-50/30 ring-1 ring-rose-500'
                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="decision"
                                    value="pending_fix"
                                    checked={data.status === 'pending_fix'}
                                    onChange={() => setData('status', 'pending_fix')}
                                    className="mt-1 h-4 w-4 text-rose-600 focus:ring-rose-500"
                                />
                                <div>
                                    <span className="block font-semibold text-slate-900">Request Revision (Pending Fix)</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">
                                        Sends logbook back to student to address flagged entries.
                                    </span>
                                </div>
                            </label>
                        </div>

                        <div className="mt-5">
                            <label htmlFor="feedback" className="block text-sm font-semibold text-slate-700">
                                Supervisor Feedback / Instructions
                            </label>
                            <textarea
                                id="feedback"
                                rows={4}
                                value={data.supervisor_feedback}
                                onChange={(e) => setData('supervisor_feedback', e.target.value)}
                                placeholder="Write feedback or explain what needs fixing..."
                                className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.supervisor_feedback && (
                                <p className="mt-1 text-xs text-rose-600">{errors.supervisor_feedback}</p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:opacity-50 ${
                                    data.status === 'pending_fix'
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                }`}
                            >
                                {processing ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <CheckCircle2 size={18} />
                                )}
                                {data.status === 'pending_fix'
                                    ? 'Submit for Student Revision'
                                    : 'Mark as Approved'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}