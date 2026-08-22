import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
} from 'lucide-react';

interface Props {
    date?: string;
}

export default function LogbookSubmission({
    date,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Date
    |--------------------------------------------------------------------------
    */

    const selectedDate = date
        ? new Date(`${date}T00:00:00`)
        : new Date();

    const formattedDate =
        selectedDate.toLocaleDateString(
            'en-GB',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }
        );

    const shortDate =
        selectedDate.toLocaleDateString(
            'en-GB',
            {
                day: 'numeric',
                month: 'long',
            }
        );

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    |
    | These fields are frontend-only for now.
    | Your friend can connect them to the backend later.
    |
    */

    const { data, setData, post, processing } =
        useForm({
            date: date ?? '',
            title: '',
            description: '',
            hours_worked: '8',
            remarks: '',
        });

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        /*
         * Backend route can be connected later.
         *
         * Example:
         *
         * post(route('student.logbook.store'));
         */

        console.log(
            'Daily log:',
            data
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Previous / next day
    |--------------------------------------------------------------------------
    */

    const previousDate = new Date(
        selectedDate
    );

    previousDate.setDate(
        previousDate.getDate() - 1
    );

    const nextDate = new Date(
        selectedDate
    );

    nextDate.setDate(
        nextDate.getDate() + 1
    );

    const formatRouteDate = (
        value: Date
    ) => {
        const year =
            value.getFullYear();

        const month = String(
            value.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            value.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    return (
        <div
            className="
                w-full
                min-w-0
                overflow-x-hidden
                p-6
            "
        >

            {/* =========================================================
                TOP NAVIGATION
            ========================================================== */}

            <div className="mb-8">

                <Link
                    href={route(
                        'student.logbook'
                    )}
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


            {/* =========================================================
                HEADER
            ========================================================== */}

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

                        <p
                            className="
                                mt-1
                                text-sm
                                text-muted-foreground
                            "
                        >
                            Record what you worked on
                            during this day.
                        </p>

                    </div>


                    {/* STATUS */}

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
                            className="
                                size-2
                                rounded-full
                                bg-gray-300
                            "
                        />

                        Not submitted
                    </div>

                </div>

            </div>


            {/* =========================================================
                DAY NAVIGATION
            ========================================================== */}

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


                <div
                    className="
                        hidden
                        text-center
                        sm:block
                    "
                >
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


            {/* =========================================================
                FORM
            ========================================================== */}

            <form
                onSubmit={handleSubmit}
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    bg-white
                "
            >

                {/* =====================================================
                    FORM HEADER
                ====================================================== */}

                <div
                    className="
                        border-b
                        px-6
                        py-5
                    "
                >

                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-gray-900
                        "
                    >
                        What did you work on?
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-muted-foreground
                        "
                    >
                        Describe your work and activities
                        for this day.
                    </p>

                </div>


                {/* =====================================================
                    FORM BODY
                ====================================================== */}

                <div
                    className="
                        space-y-6
                        p-6
                    "
                >

                    {/* TITLE */}

                    <div>

                        <label
                            htmlFor="title"
                            className="
                                mb-2
                                block
                                text-sm
                                font-medium
                                text-gray-900
                            "
                        >
                            Give your day a title
                            <span
                                className="
                                    ml-1
                                    font-normal
                                    text-gray-400
                                "
                            >
                                (optional)
                            </span>
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(event) =>
                                setData(
                                    'title',
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Getting settled in"
                            className="
                                w-full
                                rounded-md
                                border
                                border-gray-200
                                bg-white
                                px-4
                                py-3
                                text-sm
                                outline-none
                                transition
                                placeholder:text-gray-400
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                            "
                        />

                    </div>


                    {/* DESCRIPTION */}

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
                            What did you work on?
                        </label>

                        <textarea
                            id="description"
                            value={
                                data.description
                            }
                            onChange={(event) =>
                                setData(
                                    'description',
                                    event.target.value
                                )
                            }
                            rows={7}
                            placeholder="
Describe your tasks, activities, and what you accomplished...
                            "
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


                    {/* HOURS */}

                    


                    {/* REMARKS */}

                    

                </div>


                {/* =====================================================
                    FOOTER
                ====================================================== */}

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
                        href={route(
                            'student.logbook'
                        )}
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

        </div>
    );
}

LogbookSubmission.layout = (
    page: React.ReactNode
) => (
    <AuthenticatedLayout
        children={page}
    />
);