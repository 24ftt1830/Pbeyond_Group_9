import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    BriefcaseBusiness,
    House,
    CircleOff,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    date?: string;
    entry?: {
        status: string;
        description: string | null;
        learning_outcomes: string | null;
        issues: string | null;
    } | null;
}

export default function LogbookSubmission({
    date,
    entry,
}: Props) {
    const selectedDate = date
        ? new Date(`${date}T00:00:00`)
        : new Date();

    const formattedDate = selectedDate.toLocaleDateString(
        'en-GB',
        {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }
    );

    const shortDate = selectedDate.toLocaleDateString(
        'en-GB',
        {
            day: 'numeric',
            month: 'long',
        }
    );

    const [showDayTypePicker, setShowDayTypePicker] =
        useState(false);

    const { data, setData, post, processing } = useForm({
        date: date ?? '',
        status: entry?.status ?? 'working',
        description: entry?.description ?? '',
        learning_outcomes: entry?.learning_outcomes ?? '',
        issues: entry?.issues ?? '',
    });

    const savedDescription = entry?.description ?? '';
    const savedLearningOutcomes =
        entry?.learning_outcomes ?? '';
    const savedIssues = entry?.issues ?? '';

    const handleSubmit = (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        post(route('student.logbook.store'));
    };

    const previousDate = new Date(selectedDate);
    previousDate.setDate(
        previousDate.getDate() - 1
    );

    const nextDate = new Date(selectedDate);
    nextDate.setDate(
        nextDate.getDate() + 1
    );

    const formatRouteDate = (value: Date) => {
        const year = value.getFullYear();

        const month = String(
            value.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            value.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    return (
        <div className="w-full min-w-0 overflow-x-hidden p-6">

            {/* HEADER */}

            <div className="mb-8">

                <Link
                    href={route('student.logbook')}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-gray-500
                        transition
                        hover:text-gray-900
                    "
                >
                    <ArrowLeft className="size-4" />
                    Back to Logbook
                </Link>

            </div>


            <div className="mb-8">

                <p
                    className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-blue-600
                    "
                >
                    Daily Logbook
                </p>

                <div
                    className="
                        mt-1
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-4
                    "
                >

                    <div>

                        <h1
                            className="
                                font-sato
                                text-3xl
                                font-bold
                                text-gray-900
                            "
                        >
                            {formattedDate}
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Record what you worked on during this day.
                        </p>

                    </div>

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-gray-200
                            bg-white
                            px-3
                            py-1.5
                            text-sm
                            font-medium
                            text-gray-500
                        "
                    >
                        <span
                            className={`
                                size-2
                                rounded-full
                                ${
                                    entry
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                }
                            `}
                        />

                        {entry
                            ? 'Submitted'
                            : 'Not submitted'}
                    </div>

                </div>

            </div>


            {/* DAY NAVIGATION */}

            <div
                className="
                    mb-6
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    bg-white
                    px-4
                    py-3
                "
            >

                <Link
                    href={route(
                        'student.logbook.create',
                        {
                            date: formatRouteDate(
                                previousDate
                            ),
                        }
                    )}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-md
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-gray-500
                        hover:bg-gray-50
                        hover:text-gray-900
                    "
                >
                    <ChevronLeft className="size-4" />
                    Previous Day
                </Link>


                <div className="hidden text-center sm:block">

                    <p className="text-xs text-gray-400">
                        Selected Day
                    </p>

                    <p className="text-sm font-semibold">
                        {shortDate}
                    </p>

                </div>


                <Link
                    href={route(
                        'student.logbook.create',
                        {
                            date: formatRouteDate(
                                nextDate
                            ),
                        }
                    )}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-md
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-gray-500
                        hover:bg-gray-50
                        hover:text-gray-900
                    "
                >
                    Next Day
                    <ChevronRight className="size-4" />
                </Link>

            </div>


            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    bg-white
                "
            >

                {/* FORM HEADER */}

                <div className="border-b px-6 py-5">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Daily Log
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Record your activities, learning outcomes,
                        and any issues for this day.
                    </p>

                </div>


                {/* FORM BODY */}

                <div className="space-y-6 p-6">

                    {/* DAY TYPE */}

                    <div>

                        <label className="mb-2 block text-sm font-medium text-gray-900">
                            Day Type
                        </label>

                        <button
                            type="button"
                            onClick={() =>
                                setShowDayTypePicker(true)
                            }
                            className="
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-lg
                                border
                                border-gray-200
                                bg-white
                                px-4
                                py-3
                                text-left
                                hover:bg-gray-50
                            "
                        >

                            <span className="text-sm font-medium text-gray-700">

                                {data.status === 'working'
                                    ? 'Working Day'
                                    : data.status === 'off'
                                        ? 'Off Day'
                                        : 'None'}

                            </span>

                            <span className="text-xs text-gray-400">
                                Change
                            </span>

                        </button>

                    </div>


                    {/* WORKING DAY FIELDS */}

                    {data.status === 'working' && (
                        <>

                            {/* ACTIVITIES */}

                            <div>

                                <label
                                    htmlFor="description"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-900
                                    "
                                >
                                    Activities
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value
                                        )
                                    }
                                    rows={7}
                                    placeholder="Describe your tasks, activities, and what you accomplished..."
                                    className="
                                        w-full
                                        resize-none
                                        rounded-md
                                        border
                                        border-gray-200
                                        bg-white
                                        px-4
                                        py-3
                                        text-sm
                                        leading-6
                                        outline-none
                                        transition
                                        placeholder:text-gray-400
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                />

                                <div
                                    className="
                                        mt-2
                                        text-right
                                        text-xs
                                        text-gray-400
                                    "
                                >
                                    {data.description.length}{' '}
                                    characters
                                </div>

                            </div>


                            {/* LEARNING OUTCOMES */}

                            <div>

                                <label
                                    htmlFor="learning_outcomes"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-900
                                    "
                                >
                                    Learning Outcomes
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <textarea
                                    id="learning_outcomes"
                                    value={
                                        data.learning_outcomes
                                    }
                                    onChange={(event) =>
                                        setData(
                                            'learning_outcomes',
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="What did you learn or accomplish today?"
                                    className="
                                        w-full
                                        resize-none
                                        rounded-md
                                        border
                                        border-gray-200
                                        bg-white
                                        px-4
                                        py-3
                                        text-sm
                                        leading-6
                                        outline-none
                                        transition
                                        placeholder:text-gray-400
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                />

                                <div
                                    className="
                                        mt-2
                                        text-right
                                        text-xs
                                        text-gray-400
                                    "
                                >
                                    {data.learning_outcomes.length}{' '}
                                    characters
                                </div>

                            </div>


                            {/* ISSUES */}

                            <div>

                                <label
                                    htmlFor="issues"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-900
                                    "
                                >
                                    Issues
                                    <span className="ml-1 font-normal text-gray-400">
                                        (optional)
                                    </span>
                                </label>

                                <textarea
                                    id="issues"
                                    value={data.issues}
                                    onChange={(event) =>
                                        setData(
                                            'issues',
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="Any problems, challenges, or issues?"
                                    className="
                                        w-full
                                        resize-none
                                        rounded-md
                                        border
                                        border-gray-200
                                        bg-white
                                        px-4
                                        py-3
                                        text-sm
                                        leading-6
                                        outline-none
                                        transition
                                        placeholder:text-gray-400
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                />

                                <p className="mt-2 text-xs text-gray-400">
                                    Leave this blank if you did not encounter
                                    any issues.
                                </p>

                            </div>

                        </>
                    )}

                </div>


                {/* FOOTER */}

                <div
                    className="
                        flex
                        flex-col-reverse
                        gap-3
                        border-t
                        bg-gray-50/50
                        px-6
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <Link
                        href={route('student.logbook')}
                        className="
                            rounded-md
                            border
                            border-gray-200
                            bg-white
                            px-4
                            py-2
                            text-center
                            text-sm
                            font-medium
                            text-gray-600
                            hover:bg-gray-50
                        "
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-md
                            bg-blue-600
                            px-5
                            py-2
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <CheckCircle2 className="size-4" />
                        Save This Day
                    </button>

                </div>

            </form>


            {/* DAY TYPE POPUP */}

            {showDayTypePicker && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-center
                        justify-center
                        bg-black/20
                        p-4
                    "
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowDayTypePicker(false);
                        }
                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-xl
                            border
                            bg-white
                            p-6
                            shadow-2xl
                        "
                    >

                        <div
                            className="
                                mb-6
                                flex
                                items-start
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <h2 className="text-lg font-semibold text-gray-900">
                                    Change day type
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Choose the type of day for this date.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDayTypePicker(false)
                                }
                                className="
                                    rounded-md
                                    px-2
                                    text-xl
                                    leading-none
                                    text-gray-400
                                    hover:bg-gray-100
                                    hover:text-gray-700
                                "
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        <div className="space-y-2">

                            {/* WORKING DAY */}

                            <button
                                type="button"
                                onClick={() => {

                                    setData(
                                        'status',
                                        'working'
                                    );

                                    setData(
                                        'description',
                                        savedDescription
                                    );

                                    setData(
                                        'learning_outcomes',
                                        savedLearningOutcomes
                                    );

                                    setData(
                                        'issues',
                                        savedIssues
                                    );

                                    setShowDayTypePicker(false);
                                }}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-lg
                                    border
                                    p-4
                                    text-left
                                    transition
                                    ${
                                        data.status === 'working'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                                        <BriefcaseBusiness className="size-5 text-gray-700" />
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-gray-900">
                                            Working Day
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Continue with your daily log submission.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={`
                                        flex
                                        size-4
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        ${
                                            data.status === 'working'
                                                ? 'border-blue-600'
                                                : 'border-gray-300'
                                        }
                                    `}
                                >
                                    {data.status === 'working' && (
                                        <div className="size-2 rounded-full bg-blue-600" />
                                    )}
                                </div>

                            </button>


                            {/* OFF DAY */}

                            <button
                                type="button"
                                onClick={() => {

                                    setData(
                                        'status',
                                        'off'
                                    );

                                    setData(
                                        'description',
                                        ''
                                    );

                                    setData(
                                        'learning_outcomes',
                                        ''
                                    );

                                    setData(
                                        'issues',
                                        ''
                                    );

                                    setShowDayTypePicker(false);
                                }}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-lg
                                    border
                                    p-4
                                    text-left
                                    transition
                                    ${
                                        data.status === 'off'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                                        <House className="size-5 text-gray-700" />
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-gray-900">
                                            Off Day
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            No daily work log is required.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={`
                                        flex
                                        size-4
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        ${
                                            data.status === 'off'
                                                ? 'border-blue-600'
                                                : 'border-gray-300'
                                        }
                                    `}
                                >
                                    {data.status === 'off' && (
                                        <div className="size-2 rounded-full bg-blue-600" />
                                    )}
                                </div>

                            </button>


                            {/* NONE */}

                            <button
                                type="button"
                                onClick={() => {

                                    setData(
                                        'status',
                                        'none'
                                    );

                                    setData(
                                        'description',
                                        ''
                                    );

                                    setData(
                                        'learning_outcomes',
                                        ''
                                    );

                                    setData(
                                        'issues',
                                        ''
                                    );

                                    setShowDayTypePicker(false);
                                }}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-lg
                                    border
                                    p-4
                                    text-left
                                    transition
                                    ${
                                        data.status === 'none'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                                        <CircleOff className="size-5 text-gray-700" />
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-gray-900">
                                            None
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Leave this day without a selected status.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={`
                                        flex
                                        size-4
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        ${
                                            data.status === 'none'
                                                ? 'border-blue-600'
                                                : 'border-gray-300'
                                        }
                                    `}
                                >
                                    {data.status === 'none' && (
                                        <div className="size-2 rounded-full bg-blue-600" />
                                    )}
                                </div>

                            </button>

                        </div>


                        <div className="mt-6 flex justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDayTypePicker(false)
                                }
                                className="
                                    rounded-md
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-gray-600
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

LogbookSubmission.layout = (
    page: React.ReactNode
) => (
    <AuthenticatedLayout children={page} />
);