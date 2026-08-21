import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useMemo, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    BriefcaseBusiness,
    Home,
    CalendarOff,
    UserX,
    CalendarCheck,
    CheckCircle2,
    CircleHelp,
} from 'lucide-react';

interface LogbookDay {
    date: Date;
    dayName: string;
    formattedDate: string;
}

interface LogbookWeek {
    weekNumber: number;
    days: LogbookDay[];
}

type DayStatus =
    | 'not_set'
    | 'working'
    | 'off'
    | 'holiday'
    | 'absent'
    | 'leave'
    | 'completed';

interface DayEntry {
    status: DayStatus;
}

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const STATUS_LABELS: Record<DayStatus, string> = {
    not_set: 'Not set',
    working: 'Working Day',
    off: 'Off Day',
    holiday: 'Company Holiday',
    absent: 'Absent',
    leave: 'On Leave',
    completed: 'Completed',
};

const STATUS_ICONS = {
    working: BriefcaseBusiness,
    off: Home,
    holiday: CalendarOff,
    absent: UserX,
    leave: CalendarCheck,
};

const STATUS_DESCRIPTIONS = {
    working: 'Continue to your daily log submission.',
    off: 'No log is required for this day.',
    holiday: 'The company was closed for this day.',
    absent: 'You were absent from work.',
    leave: 'You were on leave for this day.',
};

export default function Logbook() {
    const today = new Date();

    const [currentMonth, setCurrentMonth] = useState(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        )
    );

    const [selectedWeek, setSelectedWeek] = useState(0);

    const [showMonthPicker, setShowMonthPicker] =
        useState(false);

    const [showYearPicker, setShowYearPicker] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | FRONTEND-ONLY DAY STATUS
    |--------------------------------------------------------------------------
    */

    const [dayEntries, setDayEntries] = useState<
        Record<string, DayEntry>
    >({});

    const [selectedDateKey, setSelectedDateKey] =
        useState<string | null>(null);

    const [showDayPanel, setShowDayPanel] =
        useState(false);

    const [selectedStatus, setSelectedStatus] =
        useState<DayStatus>('not_set');

    const currentYear =
        currentMonth.getFullYear();

    const currentMonthIndex =
        currentMonth.getMonth();

    /*
    |--------------------------------------------------------------------------
    | Generate calendar weeks
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | Every week is a COMPLETE Monday -> Sunday week.
    |
    | The first week starts on the Monday of the
    | week containing the 1st of the selected month.
    |
    | The last week ends on the Sunday of the
    | week containing the last day of the month.
    |
    | This means weeks can contain days from the
    | previous or next month.
    |
    | Example:
    |
    | September 2026
    |
    | Week 1:
    | Monday 31 August  ← Previous month
    | Tuesday 1 September
    | ...
    | Sunday 6 September
    |
    | Week 5:
    | Monday 28 September
    | ...
    | Wednesday 30 September
    | Thursday 1 October ← Next month
    | ...
    | Sunday 4 October
    |
    */

    const weeks = useMemo<LogbookWeek[]>(() => {
        const year =
            currentMonth.getFullYear();

        const month =
            currentMonth.getMonth();

        const firstDay =
            new Date(year, month, 1);

        const lastDay =
            new Date(year, month + 1, 0);

        /*
         * Convert JavaScript's:
         *
         * Sunday = 0
         * Monday = 1
         * ...
         *
         * into:
         *
         * Monday = 0
         * Tuesday = 1
         * ...
         * Sunday = 6
         */

        const firstDayOffset =
            (firstDay.getDay() + 6) % 7;

        /*
         * Find Monday of the week containing
         * the first day of the month.
         */

        const firstMonday =
            new Date(firstDay);

        firstMonday.setDate(
            firstDay.getDate() -
                firstDayOffset
        );

        /*
         * Find Sunday of the week containing
         * the last day of the month.
         */

        const lastDayOffset =
            (lastDay.getDay() + 6) % 7;

        const lastSunday =
            new Date(lastDay);

        lastSunday.setDate(
            lastDay.getDate() +
                (6 - lastDayOffset)
        );

        const generatedWeeks: LogbookWeek[] =
            [];

        let weekStart =
            new Date(firstMonday);

        let weekNumber = 1;

        /*
         * Generate complete Monday-Sunday weeks.
         */

        while (weekStart <= lastSunday) {
            const days: LogbookDay[] = [];

            for (let i = 0; i < 7; i++) {
                const date =
                    new Date(weekStart);

                date.setDate(
                    weekStart.getDate() + i
                );

                days.push({
                    date,

                    dayName:
                        date.toLocaleDateString(
                            'en-GB',
                            {
                                weekday: 'long',
                            }
                        ),

                    formattedDate:
                        date.toLocaleDateString(
                            'en-GB',
                            {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            }
                        ),
                });
            }

            generatedWeeks.push({
                weekNumber,
                days,
            });

            weekStart =
                new Date(weekStart);

            weekStart.setDate(
                weekStart.getDate() + 7
            );

            weekNumber++;
        }

        return generatedWeeks;
    }, [currentMonth]);

    /*
    |--------------------------------------------------------------------------
    | Active week
    |--------------------------------------------------------------------------
    */

    const activeWeekIndex =
        selectedWeek < weeks.length
            ? selectedWeek
            : 0;

    const selectedWeekData =
        weeks[activeWeekIndex];

    /*
    |--------------------------------------------------------------------------
    | Date key
    |--------------------------------------------------------------------------
    */

    const getDateKey = (date: Date) => {
        const year =
            date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            date.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Open day
    |--------------------------------------------------------------------------
    */

    const openDay = (day: LogbookDay) => {
        const key =
            getDateKey(day.date);

        const existing =
            dayEntries[key];

        setSelectedDateKey(key);

        setSelectedStatus(
            existing?.status ??
                'not_set'
        );

        setShowDayPanel(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Save non-working day
    |--------------------------------------------------------------------------
    */

    const saveDayStatus = () => {
        if (!selectedDateKey) {
            return;
        }

        if (
            selectedStatus ===
                'not_set' ||
            selectedStatus ===
                'working'
        ) {
            return;
        }

        setDayEntries(
            (previous) => ({
                ...previous,

                [selectedDateKey]: {
                    status: selectedStatus,
                },
            })
        );

        closeDayPanel();
    };

    /*
    |--------------------------------------------------------------------------
    | Continue to daily log
    |--------------------------------------------------------------------------
    |
    | TEMPORARY:
    | Your friend can replace this with the actual
    | daily log submission route later.
    |
    */

    const continueToDailyLog = () => {
        if (!selectedDateKey) {
            return;
        }

        window.location.href =
            `/student/logbook/create?date=${selectedDateKey}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Close day panel
    |--------------------------------------------------------------------------
    */

    const closeDayPanel = () => {
        setShowDayPanel(false);
        setSelectedDateKey(null);
        setSelectedStatus('not_set');
    };

    /*
    |--------------------------------------------------------------------------
    | Month navigation
    |--------------------------------------------------------------------------
    */

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(
                currentYear,
                currentMonthIndex - 1,
                1
            )
        );

        setSelectedWeek(0);
        setShowMonthPicker(false);
        setShowYearPicker(false);
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(
                currentYear,
                currentMonthIndex + 1,
                1
            )
        );

        setSelectedWeek(0);
        setShowMonthPicker(false);
        setShowYearPicker(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Month / year picker
    |--------------------------------------------------------------------------
    */

    const changeMonth = (
        month: number,
        year: number
    ) => {
        setCurrentMonth(
            new Date(year, month, 1)
        );

        setSelectedWeek(0);
        setShowMonthPicker(false);
        setShowYearPicker(false);
    };

    const changeYear = (year: number) => {
        setCurrentMonth(
            new Date(
                year,
                currentMonthIndex,
                1
            )
        );

        setSelectedWeek(0);
        setShowYearPicker(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Year options
    |--------------------------------------------------------------------------
    */

    const yearOptions = Array.from(
        { length: 31 },
        (_, index) =>
            currentYear - 15 + index
    );

    /*
    |--------------------------------------------------------------------------
    | Get day status
    |--------------------------------------------------------------------------
    */

    const getDayStatus = (
        day: LogbookDay
    ) => {
        const key =
            getDateKey(day.date);

        return (
            dayEntries[key]?.status ??
            'not_set'
        );
    };

    return (
        <div
            className="
                relative
                w-full
                min-w-0
                overflow-x-hidden
                p-6
            "
            style={{
                scrollbarGutter:
                    'stable',
            }}
        >

            {/* =========================================================
                HEADER
            ========================================================== */}

            <div>
                <h1 className="font-sato text-3xl font-bold">
                    Logbook
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    View and manage your weekly log entries.
                </p>
            </div>


            {/* =========================================================
                MONTH NAVIGATION
            ========================================================== */}

            <div
                className="
                    relative
                    mx-auto
                    mt-8
                    h-10
                    w-[250px]
                "
            >

                {/* LEFT ARROW */}

                <button
                    type="button"
                    onClick={
                        goToPreviousMonth
                    }
                    aria-label="Previous month"
                    className="
                        absolute
                        left-0
                        top-0
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-md
                        border
                        bg-white
                        text-gray-500
                        hover:bg-gray-50
                    "
                >
                    <ChevronLeft className="size-4" />
                </button>


                {/* MONTH BUTTON */}

                <button
                    type="button"
                    onClick={() =>
                        setShowMonthPicker(
                            !showMonthPicker
                        )
                    }
                    className="
                        absolute
                        left-1/2
                        top-0
                        flex
                        h-10
                        w-[160px]
                        -translate-x-1/2
                        items-center
                        justify-center
                        gap-2
                        rounded-md
                        text-sm
                        font-semibold
                        whitespace-nowrap
                        hover:bg-gray-50
                    "
                >
                    <CalendarDays className="size-4 shrink-0" />

                    <span>
                        {
                            MONTHS[
                                currentMonthIndex
                            ]
                        }{' '}
                        {currentYear}
                    </span>
                </button>


                {/* RIGHT ARROW */}

                <button
                    type="button"
                    onClick={
                        goToNextMonth
                    }
                    aria-label="Next month"
                    className="
                        absolute
                        right-0
                        top-0
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-md
                        border
                        bg-white
                        text-gray-500
                        hover:bg-gray-50
                    "
                >
                    <ChevronRight className="size-4" />
                </button>


                {/* =====================================================
                    MONTH / YEAR PICKER
                ====================================================== */}

                {showMonthPicker && (
                    <div
                        className="
                            absolute
                            left-1/2
                            top-12
                            z-50
                            w-[320px]
                            -translate-x-1/2
                            rounded-xl
                            border
                            bg-white
                            p-5
                            shadow-lg
                        "
                    >

                        {showYearPicker ? (
                            <>
                                {/* YEAR PICKER */}

                                <div
                                    className="
                                        mb-6
                                        flex
                                        items-center
                                        justify-between
                                        gap-8
                                    "
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeYear(
                                                currentYear -
                                                    1
                                            )
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-md
                                            border
                                            border-gray-200
                                            bg-white
                                            text-gray-600
                                            hover:bg-gray-50
                                        "
                                    >
                                        <ChevronLeft className="size-4" />
                                    </button>

                                    <div
                                        className="
                                            flex-1
                                            text-center
                                            text-lg
                                            font-semibold
                                            text-gray-900
                                            whitespace-nowrap
                                        "
                                    >
                                        Select Year
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeYear(
                                                currentYear +
                                                    1
                                            )
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-md
                                            border
                                            border-gray-200
                                            bg-white
                                            text-gray-600
                                            hover:bg-gray-50
                                        "
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>


                                {/* YEAR GRID */}

                                <div
                                    className="
                                        grid
                                        grid-cols-3
                                        gap-3
                                    "
                                >
                                    {yearOptions.map(
                                        (year) => {
                                            const isSelected =
                                                year ===
                                                currentYear;

                                            return (
                                                <button
                                                    type="button"
                                                    key={year}
                                                    onClick={() =>
                                                        changeYear(
                                                            year
                                                        )
                                                    }
                                                    className={`
                                                        flex
                                                        h-12
                                                        items-center
                                                        justify-center
                                                        rounded-md
                                                        border
                                                        text-sm
                                                        font-medium
                                                        transition
                                                        ${
                                                            isSelected
                                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    {year}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>


                                {/* DIVIDER */}

                                <div
                                    className="
                                        my-6
                                        border-t
                                        border-gray-200
                                    "
                                />


                                {/* BACK */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowYearPicker(
                                            false
                                        )
                                    }
                                    className="
                                        flex
                                        h-11
                                        w-full
                                        items-center
                                        justify-center
                                        rounded-md
                                        border
                                        border-gray-200
                                        bg-white
                                        text-sm
                                        font-medium
                                        text-gray-600
                                        hover:bg-gray-50
                                    "
                                >
                                    Back to Months
                                </button>
                            </>
                        ) : (
                            <>
                                {/* MONTH PICKER */}

                                <div
                                    className="
                                        mb-5
                                        flex
                                        items-center
                                        justify-between
                                        gap-8
                                    "
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeYear(
                                                currentYear -
                                                    1
                                            )
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-md
                                            border
                                            border-gray-200
                                            bg-white
                                            text-gray-600
                                            hover:bg-gray-50
                                        "
                                    >
                                        <ChevronLeft className="size-4" />
                                    </button>


                                    {/* YEAR BUTTON */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowYearPicker(
                                                true
                                            )
                                        }
                                        className="
                                            min-w-[88px]
                                            rounded-md
                                            border
                                            border-gray-300
                                            bg-white
                                            px-4
                                            py-2
                                            text-base
                                            font-semibold
                                            text-gray-900
                                            hover:bg-gray-50
                                        "
                                    >
                                        {currentYear}
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeYear(
                                                currentYear +
                                                    1
                                            )
                                        }
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-md
                                            border
                                            border-gray-200
                                            bg-white
                                            text-gray-600
                                            hover:bg-gray-50
                                        "
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>


                                {/* DIVIDER */}

                                <div
                                    className="
                                        mb-5
                                        border-t
                                        border-gray-200
                                    "
                                />


                                {/* MONTH GRID */}

                                <div
                                    className="
                                        grid
                                        grid-cols-3
                                        gap-3
                                    "
                                >
                                    {MONTHS.map(
                                        (
                                            month,
                                            index
                                        ) => {
                                            const isSelected =
                                                index ===
                                                currentMonthIndex;

                                            return (
                                                <button
                                                    type="button"
                                                    key={month}
                                                    onClick={() =>
                                                        changeMonth(
                                                            index,
                                                            currentYear
                                                        )
                                                    }
                                                    className={`
                                                        flex
                                                        h-11
                                                        items-center
                                                        justify-center
                                                        rounded-md
                                                        text-sm
                                                        font-medium
                                                        transition
                                                        ${
                                                            isSelected
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                        }
                                                    `}
                                                >
                                                    {month.slice(
                                                        0,
                                                        3
                                                    )}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            </>
                        )}

                    </div>
                )}

            </div>


            {/* =========================================================
                WEEK NAVIGATION
            ========================================================== */}

            <div
                className="
                    mt-6
                    w-full
                    border-b
                    border-gray-200
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        h-[47px]
                        w-full
                        max-w-[900px]
                        items-stretch
                        justify-center
                    "
                >
                    {weeks.map(
                        (week, index) => {
                            const isSelected =
                                activeWeekIndex ===
                                index;

                            return (
                                <button
                                    type="button"
                                    key={
                                        week.weekNumber
                                    }
                                    onClick={() =>
                                        setSelectedWeek(
                                            index
                                        )
                                    }
                                    className={`
                                        relative
                                        flex
                                        h-[47px]
                                        min-w-0
                                        flex-1
                                        basis-0
                                        items-center
                                        justify-center
                                        px-4
                                        text-sm
                                        font-medium
                                        whitespace-nowrap
                                        bg-transparent
                                        ${
                                            isSelected
                                                ? 'text-blue-600'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    Week{' '}
                                    {
                                        week.weekNumber
                                    }

                                    {isSelected && (
                                        <span
                                            className="
                                                absolute
                                                bottom-0
                                                left-0
                                                right-0
                                                h-[2px]
                                                bg-blue-600
                                            "
                                        />
                                    )}
                                </button>
                            );
                        }
                    )}
                </div>
            </div>


            {/* =========================================================
                DAYS
            ========================================================== */}

            <div
                className="
                    mt-4
                    overflow-hidden
                    rounded-xl
                    border
                    bg-white
                "
            >
                {selectedWeekData?.days.map(
                    (day) => {
                        const status =
                            getDayStatus(day);

                        /*
                         * Determine whether this day
                         * belongs to the previous or
                         * next month relative to the
                         * currently selected month.
                         */

                        const isPreviousMonth =
                            day.date.getFullYear() <
                                currentYear ||
                            (
                                day.date.getFullYear() ===
                                    currentYear &&
                                day.date.getMonth() <
                                    currentMonthIndex
                            );

                        const isNextMonth =
                            day.date.getFullYear() >
                                currentYear ||
                            (
                                day.date.getFullYear() ===
                                    currentYear &&
                                day.date.getMonth() >
                                    currentMonthIndex
                            );

                        const isOutsideCurrentMonth =
                            isPreviousMonth ||
                            isNextMonth;

                        return (
                            <button
                                type="button"
                                key={day.date.toISOString()}
                                onClick={() =>
                                    openDay(day)
                                }
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    border-b
                                    px-4
                                    py-4
                                    text-left
                                    last:border-b-0
                                    hover:bg-gray-50
                                "
                            >
                                <div className="min-w-0">

                                    <div className="flex items-center gap-2">

                                        <p
                                            className={`
                                                font-semibold
                                                ${
                                                    isOutsideCurrentMonth
                                                        ? 'text-gray-500'
                                                        : 'text-gray-900'
                                                }
                                            `}
                                        >
                                            {
                                                day.dayName
                                            }
                                        </p>


                                        {isPreviousMonth && (
                                            <span
                                                className="
                                                    rounded-full
                                                    bg-gray-100
                                                    px-2
                                                    py-0.5
                                                    text-[10px]
                                                    font-medium
                                                    text-gray-500
                                                "
                                            >
                                                Previous month
                                            </span>
                                        )}


                                        {isNextMonth && (
                                            <span
                                                className="
                                                    rounded-full
                                                    bg-gray-100
                                                    px-2
                                                    py-0.5
                                                    text-[10px]
                                                    font-medium
                                                    text-gray-500
                                                "
                                            >
                                                Next month
                                            </span>
                                        )}

                                    </div>


                                    <p className="text-sm text-muted-foreground">
                                        {
                                            day.formattedDate
                                        }
                                    </p>

                                </div>


                                <div
                                    className="
                                        ml-4
                                        flex
                                        shrink-0
                                        items-center
                                        gap-3
                                    "
                                >
                                    {status ===
                                    'completed' ? (
                                        <span
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                                text-sm
                                                font-medium
                                                text-green-600
                                            "
                                        >
                                            <CheckCircle2 className="size-4" />
                                            Completed
                                        </span>
                                    ) : status ===
                                      'not_set' ? (
                                        <span
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                                text-sm
                                                text-gray-400
                                            "
                                        >
                                            <CircleHelp className="size-4" />
                                            Not set
                                        </span>
                                    ) : (
                                        <span
                                            className="
                                                text-sm
                                                font-medium
                                                text-gray-600
                                            "
                                        >
                                            {
                                                STATUS_LABELS[
                                                    status
                                                ]
                                            }
                                        </span>
                                    )}

                                    <ChevronRight
                                        className="
                                            size-4
                                            text-gray-400
                                        "
                                    />
                                </div>

                            </button>
                        );
                    }
                )}
            </div>


            {/* =========================================================
                DAY STATUS MODAL
            ========================================================== */}

            {showDayPanel &&
                selectedDateKey && (
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
                        onMouseDown={(
                            event
                        ) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDayPanel();
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

                            {/* HEADER */}

                            <div className="mb-6">

                                <div className="flex items-start justify-between gap-4">

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            What type of day is this?
                                        </h2>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {selectedWeekData?.days.find(
                                                (
                                                    day
                                                ) =>
                                                    getDateKey(
                                                        day.date
                                                    ) ===
                                                    selectedDateKey
                                            )?.formattedDate}
                                        </p>
                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            closeDayPanel
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
                                    >
                                        ×
                                    </button>

                                </div>

                            </div>


                            {/* DAY TYPES */}

                            <div className="space-y-2">

                                {(
                                    [
                                        'working',
                                        'off',
                                        'holiday',
                                        'absent',
                                        'leave',
                                    ] as DayStatus[]
                                ).map(
                                    (
                                        status
                                    ) => {
                                        const Icon =
                                            STATUS_ICONS[
                                                status as keyof typeof STATUS_ICONS
                                            ];

                                        const isSelected =
                                            selectedStatus ===
                                            status;

                                        return (
                                            <button
                                                type="button"
                                                key={status}
                                                onClick={() =>
                                                    setSelectedStatus(
                                                        status
                                                    )
                                                }
                                                className={`
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    rounded-lg
                                                    border
                                                    p-3
                                                    text-left
                                                    transition
                                                    ${
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:bg-gray-50'
                                                    }
                                                `}
                                            >

                                                <div
                                                    className={`
                                                        flex
                                                        size-9
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-md
                                                        ${
                                                            isSelected
                                                                ? 'bg-white'
                                                                : 'bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    <Icon className="size-4" />
                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <p className="text-sm font-semibold">
                                                        {
                                                            STATUS_LABELS[
                                                                status
                                                            ]
                                                        }
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            STATUS_DESCRIPTIONS[
                                                                status as keyof typeof STATUS_DESCRIPTIONS
                                                            ]
                                                        }
                                                    </p>

                                                </div>


                                                <div
                                                    className={`
                                                        flex
                                                        size-4
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        border
                                                        ${
                                                            isSelected
                                                                ? 'border-blue-600'
                                                                : 'border-gray-300'
                                                        }
                                                    `}
                                                >
                                                    {isSelected && (
                                                        <div className="size-2 rounded-full bg-blue-600" />
                                                    )}
                                                </div>

                                            </button>
                                        );
                                    }
                                )}

                            </div>


                            {/* ACTIONS */}

                            <div className="mt-6 flex justify-end gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        closeDayPanel
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


                                {selectedStatus ===
                                'working' ? (
                                    <button
                                        type="button"
                                        onClick={
                                            continueToDailyLog
                                        }
                                        className="
                                            rounded-md
                                            bg-blue-600
                                            px-4
                                            py-2
                                            text-sm
                                            font-medium
                                            text-white
                                            hover:bg-blue-700
                                        "
                                    >
                                        Continue to Daily Log
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={
                                            saveDayStatus
                                        }
                                        disabled={
                                            selectedStatus ===
                                            'not_set'
                                        }
                                        className="
                                            rounded-md
                                            bg-blue-600
                                            px-4
                                            py-2
                                            text-sm
                                            font-medium
                                            text-white
                                            hover:bg-blue-700
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        Save Day
                                    </button>
                                )}

                            </div>

                        </div>
                    </div>
                )}

        </div>
    );
}

Logbook.layout = (
    page: React.ReactNode
) => (
    <AuthenticatedLayout
        children={page}
    />
);