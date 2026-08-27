import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    FileText,
    AlertCircle,
    CalendarDays,
    UserRound,
    ChevronRight,
} from 'lucide-react';

interface Submission {
    id: number;
    student_id: number;
    week_start: string;
    week_end: string;
    status: string;
    submitted_at: string | null;
}

interface LogbookEntry {
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

export default function LogbookReview({
    submission,
    entries,
}: Props) {
    const markAsReviewed = () => {
        if (
            !confirm(
                'Are you sure you want to mark this weekly logbook as reviewed?'
            )
        ) {
            return;
        }

        router.post(
            `/academic-supervisor/logbook/${submission.id}/mark-reviewed`
        );
    };

    const workdayCount = entries.filter(
        (entry) => entry.status === 'working'
    ).length;

    const offdayCount = entries.filter(
        (entry) => entry.status === 'off'
    ).length;

    return (
        <>
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

                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                            {submission.status || 'Pending Review'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                                        <span>
                                            Student ID: {submission.student_id}
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={14} />
                                            {new Date(
                                                submission.week_start
                                            ).toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                            {' – '}
                                            {new Date(
                                                submission.week_end
                                            ).toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Weekly industrial placement logbook submission
                                    </p>
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

                    {/* Page heading */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-blue-600">
                            Academic Supervisor Portal
                        </p>

                        <h2 className="mt-1 text-2xl font-bold tracking-tight">
                            Weekly Logbook Review
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review the student's weekly activities, learning
                            outcomes, and reported issues before approving the
                            submission.
                        </p>
                    </div>

                    {/* KPI Cards */}
                    <section className="mb-8 grid gap-4 md:grid-cols-3">

                        {/* Days Logged */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Days Logged
                                    </p>

                                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        {entries.length} / 7
                                    </div>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {workdayCount} workday
                                        {workdayCount !== 1 ? 's' : ''} ·{' '}
                                        {offdayCount} offday
                                        {offdayCount !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                    <CalendarDays size={21} />
                                </div>
                            </div>
                        </div>

                        {/* Review Status */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Review Status
                                    </p>

                                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        {submission.status || 'Pending Review'}
                                    </div>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Awaiting supervisor action
                                    </p>
                                </div>

                                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                                    <Clock3 size={21} />
                                </div>
                            </div>
                        </div>

                        {/* Submission Date */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Submission Date
                                    </p>

                                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        {submission.submitted_at
                                            ? new Date(
                                                  submission.submitted_at
                                              ).toLocaleDateString(undefined, {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </div>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Submitted by student
                                    </p>
                                </div>

                                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                    <CheckCircle2 size={21} />
                                </div>
                            </div>
                        </div>

                    </section>

                    {/* Weekly Entries */}
                    <section>
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Weekly Entries
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {new Date(
                                        submission.week_start
                                    ).toLocaleDateString(undefined, {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                    {' — '}
                                    {new Date(
                                        submission.week_end
                                    ).toLocaleDateString(undefined, {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div className="hidden items-center gap-4 text-xs text-slate-500 sm:flex">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Workday
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                                    Offday
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {entries.map((entry, index) => {
                                const isWorkday = entry.status === 'working';

                                return (
                                    <article
                                        key={entry.date}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                    >
                                        {/* Entry Header */}
                                        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                                                        isWorkday
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-slate-900">
                                                        {new Date(
                                                            entry.date
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                weekday: 'long',
                                                            }
                                                        )}
                                                    </h3>

                                                    <p className="text-sm text-slate-500">
                                                        {new Date(
                                                            entry.date
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                    isWorkday
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {isWorkday ? (
                                                    <CheckCircle2 size={14} />
                                                ) : (
                                                    <CalendarDays size={14} />
                                                )}

                                                {isWorkday
                                                    ? 'Workday'
                                                    : 'Offday'}
                                            </span>
                                        </div>

                                        {/* Entry Content */}
                                        {isWorkday ? (
                                            <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">

                                                {/* Activities */}
                                                <div className="p-5">
                                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        Activities
                                                    </p>

                                                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                        {entry.description ||
                                                            'No activities provided.'}
                                                    </p>
                                                </div>

                                                {/* Learning Outcomes */}
                                                <div className="p-5">
                                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        Learning Outcomes
                                                    </p>

                                                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                        {entry.learning_outcomes ||
                                                            'No learning outcomes provided.'}
                                                    </p>
                                                </div>

                                                {/* Issues */}
                                                <div className="p-5">
                                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        Issues
                                                    </p>

                                                    <div className="flex gap-2">
                                                        {entry.issues && (
                                                            <AlertCircle
                                                                size={16}
                                                                className="mt-0.5 shrink-0 text-amber-500"
                                                            />
                                                        )}

                                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                            {entry.issues ||
                                                                'No issues reported.'}
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="px-5 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                        <CalendarDays size={17} />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700">
                                                            Student marked this
                                                            day as an Offday.
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            No work activities
                                                            were recorded.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {entries.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <FileText size={22} />
                                </div>

                                <p className="mt-4 text-sm font-semibold text-slate-900">
                                    No logbook entries found.
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    There are no daily entries for this weekly
                                    submission.
                                </p>
                            </div>
                        )}
                    </section>
                </main>

                {/* Sticky Review Bar */}
                <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                                Finished reviewing?
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-500">
                                Mark this weekly logbook as reviewed once you
                                have checked the entries.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={markAsReviewed}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                        >
                            <CheckCircle2 size={18} />
                            <span className="hidden sm:inline">
                                Mark as Reviewed
                            </span>
                            <span className="sm:hidden">Review</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}