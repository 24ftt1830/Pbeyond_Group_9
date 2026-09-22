import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    BriefcaseBusiness,
    Home,
    CheckCircle2,
    CircleHelp,
    LockKeyhole,
    MessageSquare,
    Flag,
} from 'lucide-react';

interface LogbookEntryProp {
    id?: number;
    status: string;
    description: string | null;
    learning_outcomes: string | null;
    issues: string | null;
}

interface WeeklySubmission {
    week_start: string;
    week_end: string;
    status: 'submitted' | 'pending' | 'reviewed' | 'approved' | 'revision' | 'needs_revision' | 'pending_fix';
    supervisor_feedback?: string | null;
    flagged_entries?: (number | string)[] | null;
    submitted_at: string | null;
    reviewed_at: string | null;
}

interface Props {
    entries?: Record<string, LogbookEntryProp>;
    weeklySubmissions?: Record<string, WeeklySubmission>;
}

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
    | 'off';

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
};

const STATUS_ICONS = {
    working: BriefcaseBusiness,
    off: Home,
};

const STATUS_DESCRIPTIONS = {
    working: 'Continue to your daily log submission.',
    off: 'No log is required for this day.',
};

export default function Logbook({
    entries = {},
    weeklySubmissions = {},
}: Props) {
    const today = new Date();

    // Helper to read query parameters from the URL
    const getQueryParam = (param: string) => {
        if (typeof window === 'undefined') return null;
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    const urlWeekStart = getQueryParam('week');
    const getDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Initialize month based on the week parameter if available
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (urlWeekStart) {
            const targetDate = new Date(`${urlWeekStart}T00:00:00`);
            if (!isNaN(targetDate.getTime())) {
                return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            }
        }
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const [showMonthPicker, setShowMonthPicker] =
        useState(false);

    const [showYearPicker, setShowYearPicker] =
        useState(false);

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

        const firstDayOffset =
            (firstDay.getDay() + 6) % 7;

        const firstMonday =
            new Date(firstDay);

        firstMonday.setDate(
            firstDay.getDate() -
                firstDayOffset
        );

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

    const initialWeekIndex = useMemo(() => {
        if (!urlWeekStart) return 0;
        const idx = weeks.findIndex((w) =>
            w.days.some((d) => getDateKey(d.date) === urlWeekStart)
        );
        return idx !== -1 ? idx : 0;
    }, [weeks, urlWeekStart]);

    const [selectedWeek, setSelectedWeek] = useState(initialWeekIndex);

    useEffect(() => {
        setSelectedWeek(initialWeekIndex);
    }, [initialWeekIndex]);

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
    | Selected week submission
    |--------------------------------------------------------------------------
    */

    const selectedWeekStart = selectedWeekData
        ? getDateKey(selectedWeekData.days[0].date)
        : null;

    const selectedWeekSubmission = (() => {
        if (!selectedWeekData) {
            return undefined;
        }

        if (selectedWeekStart && weeklySubmissions[selectedWeekStart]) {
            return weeklySubmissions[selectedWeekStart];
        }

        const dayKeys = selectedWeekData.days.map((day) =>
            getDateKey(day.date)
        );

        return Object.values(weeklySubmissions).find((submission) =>
            dayKeys.some(
                (key) =>
                    key >= submission.week_start &&
                    key <= submission.week_end
            )
        );
    })();

    const isWeekSubmitted =
        selectedWeekSubmission?.status === 'submitted';

    const isWeekPending =
        selectedWeekSubmission?.status === 'pending';

    const isWeekReviewed =
        selectedWeekSubmission?.status === 'reviewed' ||
        selectedWeekSubmission?.status === 'approved';

    const isWeekNeedsRevision =
        selectedWeekSubmission?.status === 'pending_fix' ||
        selectedWeekSubmission?.status === 'revision' ||
        selectedWeekSubmission?.status === 'needs_revision';

    const flaggedEntries =
        selectedWeekSubmission?.flagged_entries ?? [];

    const isDayFlagged = (day: LogbookDay) => {
        if (flaggedEntries.length === 0) {
            return false;
        }

        const key = getDateKey(day.date);
        const entryId = entries[key]?.id;

        return flaggedEntries.some((flagged) => {
            const flaggedValue = String(flagged);

            return (
                flaggedValue === key ||
                (entryId !== undefined && flaggedValue === String(entryId))
            );
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Open day
    |--------------------------------------------------------------------------
    */

    const openDay = (day: LogbookDay) => {
        const key = getDateKey(day.date);

        // Reviewed weeks are locked.
        if (isWeekReviewed) {
            return;
        }

        const existing = entries[key];

        if (existing) {
            window.location.href =
                `/student/logbook/create?date=${key}`;

            return;
        }

        setSelectedDateKey(key);
        setSelectedStatus('not_set');
        setShowDayPanel(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Save Off Day
    |--------------------------------------------------------------------------
    */

    const saveDayStatus = () => {
        if (!selectedDateKey) {
            return;
        }

        if (selectedStatus !== 'off') {
            return;
        }

        // Reviewed weeks cannot be edited.
        if (isWeekReviewed) {
            return;
        }

        router.post(
            route('student.logbook.store'),
            {
                date: selectedDateKey,
                status: 'off',
                description: null,
                learning_outcomes: null,
                issues: null,
            },
            {
                onSuccess: () => {
                    closeDayPanel();
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Continue to daily log
    |--------------------------------------------------------------------------
    */

    const continueToDailyLog = () => {
        if (!selectedDateKey) {
            return;
        }

        // Reviewed weeks cannot be edited.
        if (isWeekReviewed) {
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

    const getDayStatus = (day: LogbookDay): DayStatus => {
        const key = getDateKey(day.date);

        const savedEntry = entries[key];

        if (savedEntry?.status === 'working') {
            return 'working';
        }

        if (savedEntry?.status === 'off') {
            return 'off';
        }

        return 'not_set';
    };

    const completedDays = selectedWeekData
        ? selectedWeekData.days.filter((day) => {
              const status = getDayStatus(day);

              return (
                  status === 'working' ||
                  status === 'off'
              );
          }).length
        : 0;

    const isWeekComplete =
        completedDays === 7;

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


                                <div
                                    className="
                                        my-6
                                        border-t
                                        border-gray-200
                                    "
                                />


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


                                <div
                                    className="
                                        mb-5
                                        border-t
                                        border-gray-200
                                    "
                                />


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
                REVIEWED LOCK MESSAGE
            ========================================================== */}

            {isWeekNeedsRevision && (
                <div
                    className="
                        mt-4
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                    "
                >
                    <MessageSquare className="size-5 text-red-600" />

                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            Week Needs Revision
                        </p>

                        <p className="text-xs text-red-700">
                            Your academic supervisor has requested changes for this week. Please check the remarks below, update your logs, and resubmit.
                        </p>
                    </div>
                </div>
            )}

            {isWeekReviewed && (
                <div
                    className="
                        mt-4
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        border
                        border-green-200
                        bg-green-50
                        px-4
                        py-3
                    "
                >
                    <LockKeyhole className="size-5 text-green-700" />

                    <div>
                        <p className="text-sm font-semibold text-green-800">
                            Week Reviewed
                        </p>

                        <p className="text-xs text-green-700">
                            This week has been reviewed by your Academic Supervisor and can no longer be edited.
                        </p>
                    </div>
                </div>
            )}


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

                        const dayIsFlagged = isDayFlagged(day);

                        return (
                            <button
                                type="button"
                                key={day.date.toISOString()}
                                onClick={() =>
                                    openDay(day)
                                }
                                disabled={isWeekReviewed}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    border-b
                                    px-4
                                    py-4
                                    text-left
                                    last:border-b-0
                                    ${
                                        isWeekReviewed
                                            ? 'cursor-not-allowed bg-gray-50'
                                            : dayIsFlagged
                                                ? 'bg-rose-50 hover:bg-rose-100'
                                                : 'hover:bg-gray-50'
                                    }
                                `}
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

                                        {dayIsFlagged && (
                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1
                                                    rounded-full
                                                    bg-rose-100
                                                    px-2
                                                    py-0.5
                                                    text-[10px]
                                                    font-medium
                                                    text-rose-700
                                                "
                                            >
                                                <Flag className="size-3" />
                                                Needs revision
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
                                    {isWeekReviewed ? (

                                        <span
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                                text-sm
                                                font-medium
                                                text-green-700
                                            "
                                        >
                                            <LockKeyhole className="size-4" />
                                            Locked
                                        </span>

                                    ) : status === 'working' ? (

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

                                    ) : status === 'not_set' ? (

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

                                    {!isWeekReviewed && (
                                        <ChevronRight
                                            className="
                                                size-4
                                                text-gray-400
                                            "
                                        />
                                    )}

                                </div>

                            </button>
                        );
                    }
                )}
            </div>

            {/* =========================================================
                WEEKLY SUBMISSION & REMARKS
            ========================================================== */}

            <div className="mt-6 flex flex-col items-end gap-4">

                {(selectedWeekSubmission?.supervisor_feedback ||
                    flaggedEntries.length > 0) && (
                    <div
                        className={`w-full rounded-xl border p-5 shadow-sm ${
                            isWeekNeedsRevision
                                ? 'border-rose-200 bg-rose-50/70'
                                : 'border-blue-200 bg-blue-50/70'
                        }`}
                    >
                        <div
                            className={`flex items-center gap-2 font-semibold ${
                                isWeekNeedsRevision
                                    ? 'text-rose-900'
                                    : 'text-blue-900'
                            }`}
                        >
                            <MessageSquare
                                className={`size-4 ${
                                    isWeekNeedsRevision
                                        ? 'text-rose-600'
                                        : 'text-blue-600'
                                }`}
                            />
                            <span>Academic Supervisor Review</span>
                        </div>

                        {selectedWeekSubmission?.supervisor_feedback && (
                            <p
                                className={`mt-2 text-sm leading-relaxed whitespace-pre-line ${
                                    isWeekNeedsRevision
                                        ? 'text-rose-950'
                                        : 'text-blue-950'
                                }`}
                            >
                                {selectedWeekSubmission.supervisor_feedback}
                            </p>
                        )}

                        {flaggedEntries.length > 0 && selectedWeekData && (
                            <div className="mt-3">
                                <p
                                    className={`text-xs font-semibold uppercase tracking-wide ${
                                        isWeekNeedsRevision
                                            ? 'text-rose-700'
                                            : 'text-blue-700'
                                    }`}
                                >
                                    Days flagged for revision
                                </p>
                                <ul className="mt-2 space-y-1">
                                    {selectedWeekData.days
                                        .filter((day) => isDayFlagged(day))
                                        .map((day) => (
                                            <li
                                                key={getDateKey(day.date)}
                                                className={`flex items-center gap-2 text-sm ${
                                                    isWeekNeedsRevision
                                                        ? 'text-rose-800'
                                                        : 'text-blue-800'
                                                }`}
                                            >
                                                <Flag className="size-3.5 shrink-0" />
                                                {day.dayName} — {day.formattedDate}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {isWeekReviewed ? (
                    <button
                        type="button"
                        disabled
                        className="flex items-center gap-2 cursor-not-allowed rounded-lg border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700 opacity-90"
                    >
                        <LockKeyhole className="size-4" />
                        Reviewed & Locked
                    </button>
                ) : isWeekNeedsRevision ? (
                    <button
                        type="button"
                        disabled={!isWeekComplete}
                        onClick={() => {
                            if (!isWeekComplete || !selectedWeekStart) return;

                            router.post(
                                route('student.logbook.submit-week'),
                                { week_start: selectedWeekStart }
                            );
                        }}
                        className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                            isWeekComplete
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'cursor-not-allowed bg-gray-200 text-gray-400'
                        }`}
                    >
                        Resubmit Week
                    </button>
                ) : isWeekPending ? (
                    <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-yellow-200 bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-yellow-700 opacity-80"
                    >
                        Pending Review
                    </button>
                ) : isWeekSubmitted ? (
                    <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 opacity-80"
                    >
                        Submitted
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={!isWeekComplete}
                        onClick={() => {
                            if (!isWeekComplete || !selectedWeekStart) return;

                            router.post(
                                route('student.logbook.submit-week'),
                                { week_start: selectedWeekStart }
                            );
                        }}
                        className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                            isWeekComplete
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'cursor-not-allowed bg-gray-200 text-gray-400'
                        }`}
                    >
                        Submit Week
                    </button>
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
                        onMouseDown={(event) => {
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

                            <div className="mb-6">

                                <div className="flex items-start justify-between gap-4">

                                    <div>

                                        <h2 className="text-lg font-semibold">
                                            What type of day is this?
                                        </h2>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {selectedWeekData?.days.find(
                                                (day) =>
                                                    getDateKey(day.date) ===
                                                    selectedDateKey
                                            )?.formattedDate}
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeDayPanel}
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


                            <div className="space-y-2">

                                {(
                                    [
                                        'working',
                                        'off',
                                    ] as DayStatus[]
                                ).map((status) => {

                                    const Icon =
                                        STATUS_ICONS[
                                            status as keyof typeof STATUS_ICONS
                                        ];

                                    const isSelected =
                                        selectedStatus === status;

                                    return (
                                        <button
                                            type="button"
                                            key={status}
                                            onClick={() =>
                                                setSelectedStatus(status)
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
                                })}

                            </div>


                            <div className="mt-6 flex justify-end gap-2">

                                <button
                                    type="button"
                                    onClick={closeDayPanel}
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


                                {selectedStatus === 'working' ? (

                                    <button
                                        type="button"
                                        onClick={continueToDailyLog}
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
                                        onClick={saveDayStatus}
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