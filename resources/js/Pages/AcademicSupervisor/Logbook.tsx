import { Head, Link } from '@inertiajs/react';

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
    return (
        <>
            <Head title="Academic Supervisor - Logbook Review" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-6xl">

                    {/* HEADER */}

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Weekly Logbook Review
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Review weekly logbook submissions from students.
                        </p>
                    </div>


                    {/* =====================================================
                        PENDING REVIEW
                    ====================================================== */}

                    <div className="mb-8 rounded-xl border bg-white shadow-sm">

                        <div className="border-b px-6 py-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                Pending Review
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Weekly logbooks waiting for your review.
                            </p>
                        </div>


                        {pendingSubmissions.length === 0 ? (

                            <div className="px-6 py-10 text-center">

                                <p className="text-sm font-medium text-gray-900">
                                    No pending submissions
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    There are currently no weekly logbooks
                                    waiting for review.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y">

                                {pendingSubmissions.map(
                                    (submission) => (

                                        <div
                                            key={submission.id}
                                            className="flex items-center justify-between gap-6 px-6 py-5"
                                        >

                                            <div>

                                                <p className="text-sm font-semibold text-gray-900">
                                                    {submission.student?.full_name ??
                                                        `Student #${submission.student_id}`}
                                                </p>

                                                {submission.student?.pb_student_code && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {submission.student.pb_student_code}
                                                    </p>
                                                )}

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {formatDate(
                                                        submission.week_start
                                                    )}
                                                    {' – '}
                                                    {formatDate(
                                                        submission.week_end
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Submitted{' '}
                                                    {formatDateTime(
                                                        submission.submitted_at
                                                    )}
                                                </p>

                                            </div>


                                            <div className="flex items-center gap-3">

                                                <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                    Pending Review
                                                </span>

                                                <Link
                                                    href={`/academic-supervisor/logbook/${submission.id}/review`}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                >
                                                    Review
                                                </Link>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* =====================================================
                        REVIEWED
                    ====================================================== */}

                    <div className="rounded-xl border bg-white shadow-sm">

                        <div className="border-b px-6 py-4">

                            <h2 className="text-base font-semibold text-gray-900">
                                Reviewed
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Weekly logbooks that have already been reviewed.
                            </p>

                        </div>


                        {reviewedSubmissions.length === 0 ? (

                            <div className="px-6 py-10 text-center">

                                <p className="text-sm font-medium text-gray-900">
                                    No reviewed submissions
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Reviewed weekly logbooks will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y">

                                {reviewedSubmissions.map(
                                    (submission) => (

                                        <div
                                            key={submission.id}
                                            className="flex items-center justify-between gap-6 px-6 py-5"
                                        >

                                            <div>

                                                <p className="text-sm font-semibold text-gray-900">
                                                    {submission.student?.full_name ??
                                                        `Student #${submission.student_id}`}
                                                </p>

                                                {submission.student?.pb_student_code && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {submission.student.pb_student_code}
                                                    </p>
                                                )}

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {formatDate(
                                                        submission.week_start
                                                    )}
                                                    {' – '}
                                                    {formatDate(
                                                        submission.week_end
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Reviewed{' '}
                                                    {formatDateTime(
                                                        submission.reviewed_at
                                                    )}
                                                </p>

                                            </div>


                                            <div className="flex items-center gap-3">

                                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                                    Reviewed
                                                </span>

                                                <Link
                                                    href={`/academic-supervisor/logbook/${submission.id}/review`}
                                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                >
                                                    View
                                                </Link>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>
            </div>
        </>
    );
}