import { Head, Link, router } from '@inertiajs/react';

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

    return (
        <>
            <Head title="Review Weekly Logbook" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-5xl">

                    {/* Header */}

                    <div className="mb-6">

                        <Link
                            href="/academic-supervisor/logbook"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            ← Back to submissions
                        </Link>

                        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
                            Weekly Logbook Review
                        </h1>

                        <div className="mt-2 text-sm text-gray-500">
                            Student #{submission.student_id}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                            {new Date(
                                submission.week_start
                            ).toLocaleDateString()}
                            {' – '}
                            {new Date(
                                submission.week_end
                            ).toLocaleDateString()}
                        </div>

                    </div>


                    {/* Status */}

                    <div className="mb-6 rounded-xl border bg-white px-6 py-4 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Submission Status
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Submitted{' '}
                                    {submission.submitted_at
                                        ? new Date(
                                              submission.submitted_at
                                          ).toLocaleString()
                                        : '—'}
                                </p>
                            </div>

                            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                                Pending Review
                            </span>

                        </div>

                    </div>


                    {/* Daily Entries */}

                    <div className="space-y-5">

                        {entries.map((entry) => (

                            <div
                                key={entry.date}
                                className="rounded-xl border bg-white shadow-sm"
                            >

                                {/* Day Header */}

                                <div className="border-b px-6 py-4">

                                    <div className="flex items-center justify-between">

                                        <h2 className="text-base font-semibold text-gray-900">
                                            {new Date(
                                                entry.date
                                            ).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </h2>

                                        <span
                                            className={
                                                entry.status === 'off'
                                                    ? 'rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600'
                                                    : 'rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700'
                                            }
                                        >
                                            {entry.status === 'off'
                                                ? 'Off Day'
                                                : 'Working Day'}
                                        </span>

                                    </div>

                                </div>


                                {/* Day Content */}

                                {entry.status === 'off' ? (

                                    <div className="px-6 py-6 text-sm text-gray-500">
                                        Student marked this day as an Off Day.
                                    </div>

                                ) : (

                                    <div className="space-y-6 px-6 py-6">

                                        {/* Activities */}

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Activities
                                            </h3>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                                {entry.description ||
                                                    'No activities provided.'}
                                            </p>
                                        </div>


                                        {/* Learning Outcomes */}

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Learning Outcomes
                                            </h3>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                                {entry.learning_outcomes ||
                                                    'No learning outcomes provided.'}
                                            </p>
                                        </div>


                                        {/* Issues */}

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Issues
                                            </h3>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                                {entry.issues ||
                                                    'No issues reported.'}
                                            </p>
                                        </div>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>


                    {/* Empty State */}

                    {entries.length === 0 && (

                        <div className="mt-5 rounded-xl border bg-white px-6 py-12 text-center shadow-sm">

                            <p className="text-sm font-medium text-gray-900">
                                No logbook entries found.
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                There are no daily entries for this weekly submission.
                            </p>

                        </div>

                    )}


                    {/* Mark as Reviewed */}

                    <div className="mt-8 flex items-center justify-between rounded-xl border bg-white px-6 py-5 shadow-sm">

                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Finished reviewing?
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Mark this weekly logbook as reviewed once you have checked the entries.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={markAsReviewed}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Mark as Reviewed
                        </button>

                    </div>

                </div>
            </div>
        </>
    );
}