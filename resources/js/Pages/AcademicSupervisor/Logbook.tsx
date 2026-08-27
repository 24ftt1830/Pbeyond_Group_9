import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    Users,
} from 'lucide-react';

interface Student {
    student_id: number;
    full_name?: string;
    pb_student_code?: string;
}

interface WeeklySubmission {
    id: number;
    student_id: number;
    week_start: string;
    week_end: string;
    status: 'pending' | 'reviewed';
    submitted_at: string | null;
    reviewed_at: string | null;
    student?: Student;
}

interface Props {
    pendingSubmissions?: WeeklySubmission[];
    reviewedSubmissions?: WeeklySubmission[];
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatDateTime = (date: string | null) => {
    if (!date) {
        return '—';
    }

    return new Date(date).toLocaleString('en-GB');
};

export default function Logbook({
    pendingSubmissions = [],
    reviewedSubmissions = [],
}: Props) {
    const [activeTab, setActiveTab] = useState<
        'all' | 'pending' | 'reviewed'
    >('all');

    const totalSubmissions =
        pendingSubmissions.length + reviewedSubmissions.length;

    return (
        <>
            <Head title="Academic Supervisor - Logbook Review" />

            <div className="min-h-screen bg-slate-50 text-slate-900">
                {/* Header */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium text-blue-600">
                                    Academic Supervisor Portal
                                </p>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Weekly Logbook Review
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review weekly logbook submissions from
                                    students.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <FileText size={18} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Total Submissions
                                    </p>

                                    <p className="text-sm font-bold text-slate-900">
                                        {totalSubmissions}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-7 pb-12 sm:px-6 lg:px-8">
                    {/* KPI Summary */}
                    <section className="mb-8 grid gap-4 md:grid-cols-3">
                        {/* Pending */}
                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Pending Reviews
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                        {pendingSubmissions.length}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Waiting for your review
                                    </p>
                                </div>

                                <div className="rounded-xl bg-amber-50 p-3 text-amber-600 transition group-hover:scale-105">
                                    <Clock3 size={21} />
                                </div>
                            </div>
                        </div>

                        {/* Reviewed */}
                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Reviewed
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                        {reviewedSubmissions.length}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Completed supervisor reviews
                                    </p>
                                </div>

                                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 transition group-hover:scale-105">
                                    <CheckCircle2 size={21} />
                                </div>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Submissions
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                        {totalSubmissions}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Pending and reviewed logbooks
                                    </p>
                                </div>

                                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition group-hover:scale-105">
                                    <Users size={21} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Main Section */}
                    <section>
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Student Submissions
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Manage and review weekly logbook submissions.
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('all')}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        activeTab === 'all'
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    All
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('pending')}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        activeTab === 'pending'
                                            ? 'bg-amber-500 text-white shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    Pending
                                    {pendingSubmissions.length > 0 && (
                                        <span className="ml-1.5 opacity-75">
                                            ({pendingSubmissions.length})
                                        </span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('reviewed')}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        activeTab === 'reviewed'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    Reviewed
                                    {reviewedSubmissions.length > 0 && (
                                        <span className="ml-1.5 opacity-75">
                                            ({reviewedSubmissions.length})
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ALL */}
                        {activeTab === 'all' && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="hidden grid-cols-[minmax(280px,1.5fr)_1fr_1fr_auto] gap-6 border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
                                    <div>Student</div>
                                    <div>Week</div>
                                    <div>Status</div>
                                    <div className="text-right">Action</div>
                                </div>

                                {pendingSubmissions.length === 0 &&
                                reviewedSubmissions.length === 0 ? (
                                    <div className="px-6 py-14 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            <FileText size={22} />
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-slate-900">
                                            No submissions found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Weekly logbook submissions will
                                            appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {pendingSubmissions.map(
                                            (submission) => (
                                                <div
                                                    key={submission.id}
                                                    className="group px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                                                >
                                                    <div className="grid gap-4 md:grid-cols-[minmax(280px,1.5fr)_1fr_1fr_auto] md:items-center md:gap-6">
                                                        {/* Student */}
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                                                                {(
                                                                    submission
                                                                        .student
                                                                        ?.full_name ??
                                                                    `Student #${submission.student_id}`
                                                                )
                                                                    .trim()
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold text-slate-900">
                                                                    {submission
                                                                        .student
                                                                        ?.full_name ??
                                                                        `Student #${submission.student_id}`}
                                                                </p>

                                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                                        ID #
                                                                        {submission.student_id}
                                                                    </span>

                                                                    {submission
                                                                        .student
                                                                        ?.pb_student_code && (
                                                                        <span className="text-xs text-slate-400">
                                                                            {submission
                                                                                .student
                                                                                .pb_student_code}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Week */}
                                                        <div>
                                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 md:hidden">
                                                                Review Period
                                                            </p>

                                                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700 md:mt-0">
                                                                <CalendarDays
                                                                    size={15}
                                                                    className="text-slate-400"
                                                                />

                                                                {formatDate(
                                                                    submission.week_start
                                                                )}{' '}
                                                                –{' '}
                                                                {formatDate(
                                                                    submission.week_end
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Submitted{' '}
                                                                {formatDateTime(
                                                                    submission.submitted_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        {/* Status */}
                                                        <div>
                                                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 md:hidden">
                                                                Status
                                                            </p>

                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                Pending Review
                                                            </span>
                                                        </div>

                                                        {/* Action */}
                                                        <div className="flex md:justify-end">
                                                            <Link
                                                                href={`/academic-supervisor/logbook/${submission.id}/review`}
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                                                            >
                                                                Review
                                                                <ChevronRight
                                                                    size={15}
                                                                />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        {reviewedSubmissions.map(
                                            (submission) => (
                                                <div
                                                    key={submission.id}
                                                    className="group px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                                                >
                                                    <div className="grid gap-4 md:grid-cols-[minmax(280px,1.5fr)_1fr_1fr_auto] md:items-center md:gap-6">
                                                        {/* Student */}
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                                                                {(
                                                                    submission
                                                                        .student
                                                                        ?.full_name ??
                                                                    `Student #${submission.student_id}`
                                                                )
                                                                    .trim()
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold text-slate-900">
                                                                    {submission
                                                                        .student
                                                                        ?.full_name ??
                                                                        `Student #${submission.student_id}`}
                                                                </p>

                                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                                        ID #
                                                                        {submission.student_id}
                                                                    </span>

                                                                    {submission
                                                                        .student
                                                                        ?.pb_student_code && (
                                                                        <span className="text-xs text-slate-400">
                                                                            {submission
                                                                                .student
                                                                                .pb_student_code}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Week */}
                                                        <div>
                                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 md:hidden">
                                                                Review Period
                                                            </p>

                                                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700 md:mt-0">
                                                                <CalendarDays
                                                                    size={15}
                                                                    className="text-slate-400"
                                                                />

                                                                {formatDate(
                                                                    submission.week_start
                                                                )}{' '}
                                                                –{' '}
                                                                {formatDate(
                                                                    submission.week_end
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Reviewed{' '}
                                                                {formatDateTime(
                                                                    submission.reviewed_at
                                                                )}
                                                            </p>
                                                        </div>

                                                        {/* Status */}
                                                        <div>
                                                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 md:hidden">
                                                                Status
                                                            </p>

                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                                <CheckCircle2
                                                                    size={13}
                                                                />
                                                                Reviewed
                                                            </span>
                                                        </div>

                                                        {/* Action */}
                                                        <div className="flex md:justify-end">
                                                            <Link
                                                                href={`/academic-supervisor/logbook/${submission.id}/review`}
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                            >
                                                                View
                                                                <ChevronRight
                                                                    size={15}
                                                                />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PENDING */}
                        {activeTab === 'pending' && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {pendingSubmissions.length === 0 ? (
                                    <div className="px-6 py-14 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                                            <CheckCircle2 size={22} />
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-slate-900">
                                            All caught up
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            There are no pending logbooks waiting
                                            for review.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {pendingSubmissions.map(
                                            (submission) => (
                                                <div
                                                    key={submission.id}
                                                    className="group px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                                                >
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                                                                {(
                                                                    submission
                                                                        .student
                                                                        ?.full_name ??
                                                                    `Student #${submission.student_id}`
                                                                )
                                                                    .trim()
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold text-slate-900">
                                                                    {submission
                                                                        .student
                                                                        ?.full_name ??
                                                                        `Student #${submission.student_id}`}
                                                                </p>

                                                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                                                                    <span>
                                                                        ID #
                                                                        {
                                                                            submission.student_id
                                                                        }
                                                                    </span>

                                                                    {submission
                                                                        .student
                                                                        ?.pb_student_code && (
                                                                        <span>
                                                                            {
                                                                                submission
                                                                                    .student
                                                                                    .pb_student_code
                                                                            }
                                                                        </span>
                                                                    )}

                                                                    <span>
                                                                        {formatDate(
                                                                            submission.week_start
                                                                        )}{' '}
                                                                        –{' '}
                                                                        {formatDate(
                                                                            submission.week_end
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 sm:shrink-0">
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                Pending Review
                                                            </span>

                                                            <Link
                                                                href={`/academic-supervisor/logbook/${submission.id}/review`}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                                                            >
                                                                Review
                                                                <ChevronRight
                                                                    size={15}
                                                                />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REVIEWED */}
                        {activeTab === 'reviewed' && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {reviewedSubmissions.length === 0 ? (
                                    <div className="px-6 py-14 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            <FileText size={22} />
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-slate-900">
                                            No reviewed submissions
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Reviewed weekly logbooks will appear
                                            here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {reviewedSubmissions.map(
                                            (submission) => (
                                                <div
                                                    key={submission.id}
                                                    className="group px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                                                >
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
                                                                {(
                                                                    submission
                                                                        .student
                                                                        ?.full_name ??
                                                                    `Student #${submission.student_id}`
                                                                )
                                                                    .trim()
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold text-slate-900">
                                                                    {submission
                                                                        .student
                                                                        ?.full_name ??
                                                                        `Student #${submission.student_id}`}
                                                                </p>

                                                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                                                                    <span>
                                                                        ID #
                                                                        {
                                                                            submission.student_id
                                                                        }
                                                                    </span>

                                                                    {submission
                                                                        .student
                                                                        ?.pb_student_code && (
                                                                        <span>
                                                                            {
                                                                                submission
                                                                                    .student
                                                                                    .pb_student_code
                                                                            }
                                                                        </span>
                                                                    )}

                                                                    <span>
                                                                        {formatDate(
                                                                            submission.week_start
                                                                        )}{' '}
                                                                        –{' '}
                                                                        {formatDate(
                                                                            submission.week_end
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 sm:shrink-0">
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                                <CheckCircle2
                                                                    size={13}
                                                                />
                                                                Reviewed
                                                            </span>

                                                            <Link
                                                                href={`/academic-supervisor/logbook/${submission.id}/review`}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                            >
                                                                View
                                                                <ChevronRight
                                                                    size={15}
                                                                />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}

Logbook.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout>
        {page}
    </AuthenticatedLayout>
);