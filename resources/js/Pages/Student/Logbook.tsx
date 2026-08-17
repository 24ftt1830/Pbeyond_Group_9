import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useMemo, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
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

    // Controls the main month/year popup
    const [showMonthPicker, setShowMonthPicker] =
        useState(false);

    // Controls whether we are choosing a year
    const [showYearPicker, setShowYearPicker] =
        useState(false);

    // The year currently displayed in the year selector
    const [yearPickerCenter, setYearPickerCenter] =
        useState(today.getFullYear());

    const currentYear =
        currentMonth.getFullYear();

    const currentMonthIndex =
        currentMonth.getMonth();

    /*
    |--------------------------------------------------------------------------
    | Generate weeks
    |--------------------------------------------------------------------------
    */

    const weeks = useMemo<LogbookWeek[]>(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay =
            new Date(year, month, 1);

        const lastDay =
            new Date(year, month + 1, 0);

        // Monday = first day of week
        const firstDayOffset =
            (firstDay.getDay() + 6) % 7;

        const firstMonday =
            new Date(firstDay);

        firstMonday.setDate(
            firstDay.getDate() -
                firstDayOffset
        );

        const generatedWeeks: LogbookWeek[] = [];

        let weekStart =
            new Date(firstMonday);

        let weekNumber = 1;

        while (weekStart <= lastDay) {
            const days: LogbookDay[] = [];

            for (let i = 0; i < 7; i++) {
                const date =
                    new Date(weekStart);

                date.setDate(
                    weekStart.getDate() + i
                );

                // Only show dates belonging
                // to the selected month.
                if (
                    date.getMonth() === month
                ) {
                    days.push({
                        date,

                        dayName:
                            date.toLocaleDateString(
                                'en-GB',
                                {
                                    weekday:
                                        'long',
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
            }

            if (days.length > 0) {
                generatedWeeks.push({
                    weekNumber,
                    days,
                });
            }

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
    };

    /*
    |--------------------------------------------------------------------------
    | Change month
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

    /*
    |--------------------------------------------------------------------------
    | Change year
    |--------------------------------------------------------------------------
    */

    const changeYear = (year: number) => {
        setCurrentMonth(
            new Date(
                year,
                currentMonthIndex,
                1
            )
        );

        setSelectedWeek(0);

        // After selecting a year,
        // return to the month selection.
        setShowYearPicker(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Year picker range
    |--------------------------------------------------------------------------
    |
    | Shows 21 years:
    |
    | 2011 - 2031
    |
    | when the center year is 2021.
    |
    */

    const yearOptions = Array.from(
        { length: 21 },
        (_, index) =>
            yearPickerCenter - 10 + index
    );

    /*
    |--------------------------------------------------------------------------
    | Open year picker
    |--------------------------------------------------------------------------
    */

    const openYearPicker = () => {
        setYearPickerCenter(currentYear);
        setShowYearPicker(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Year picker previous range
    |--------------------------------------------------------------------------
    */

    const previousYearRange = () => {
        setYearPickerCenter(
            yearPickerCenter - 21
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Year picker next range
    |--------------------------------------------------------------------------
    */

    const nextYearRange = () => {
        setYearPickerCenter(
            yearPickerCenter + 21
        );
    };

    return (
        <div
            className="
                w-full
                min-w-0
                overflow-visible
                p-6
            "
            style={{
                scrollbarGutter: 'stable',
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

                {/* LEFT MONTH ARROW */}

                <button
                    type="button"
                    onClick={goToPreviousMonth}
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
                    onClick={() => {
                        setShowMonthPicker(
                            !showMonthPicker
                        );

                        setShowYearPicker(false);
                    }}
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
                        {MONTHS[currentMonthIndex]}{' '}
                        {currentYear}
                    </span>
                </button>


                {/* RIGHT MONTH ARROW */}

                <button
                    type="button"
                    onClick={goToNextMonth}
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
                            border-gray-200
                            bg-white
                            p-5
                            shadow-lg
                            overflow-visible
                        "
                    >

                    {showYearPicker ? (
                        /* =================================================
                        YEAR SELECTION VIEW
                        ================================================== */
                        <div className="w-full">

                            {/* YEAR HEADER */}
                            <div
                                className="
                                    mb-5
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    gap-6
                                "
                            >
                                <button
                                    type="button"
                                    onClick={previousYearRange}
                                    className="
                                        flex
                                        h-9
                                        w-9
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
                                        whitespace-nowrap
                                        text-lg
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    Select Year
                                </div>


                                <button
                                    type="button"
                                    onClick={nextYearRange}
                                    className="
                                        flex
                                        h-9
                                        w-9
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


                            {/* YEAR GRID */}
                            <div
                                className="
                                    grid
                                    grid-cols-3
                                    gap-1
                                "
                            >
                                {yearOptions.map((year) => {
                                    const isSelected =
                                        year === currentYear;

                                    return (
                                        <button
                                            type="button"
                                            key={year}
                                            onClick={() =>
                                                changeYear(year)
                                            }
                                            className={`
                                                flex
                                                h-11
                                                w-full
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
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>


                            {/* DIVIDER */}
                            <div
                                className="
                                    my-5
                                    border-t
                                    border-gray-200
                                "
                            />


                            {/* BACK TO MONTHS */}
                            <button
                                type="button"
                                onClick={() =>
                                    setShowYearPicker(false)
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
                                    transition
                                    hover:bg-gray-50
                                "
                            >
                                Back to Months
                            </button>

                        </div>

                    ) : (
                        /* =================================================
                        MONTH SELECTION VIEW
                        ================================================== */
                        <div className="w-full">

                            {/* YEAR HEADER */}
                            <div
                                className="
                                    mb-5
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-4
                                "
                            >

                                {/* PREVIOUS YEAR */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        changeYear(currentYear - 1)
                                    }
                                    className="
                                        flex
                                        h-9
                                        w-9
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
                                    onClick={openYearPicker}
                                    className="
                                        flex
                                        h-12
                                        w-[104px]
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-md
                                        border
                                        border-gray-300
                                        bg-white
                                        px-4
                                        text-base
                                        font-semibold
                                        text-gray-900
                                        transition
                                        hover:border-gray-400
                                        hover:bg-gray-50
                                    "
                                >
                                    {currentYear}
                                </button>


                                {/* NEXT YEAR */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        changeYear(currentYear + 1)
                                    }
                                    className="
                                        flex
                                        h-9
                                        w-9
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
                                    gap-1
                                "
                            >
                                {MONTHS.map(
                                    (month, index) => {
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

                        </div>
                    )}    

                    </div>
                )}

            </div>


            {/* =========================================================
                WEEK NAVIGATION
            ========================================================== */}

            <div
                className="mt-6 w-full border-b"
                style={{
                    borderColor: '#E5E7EB',
                }}
            >
                <div
                    className="
                        mx-auto
                        flex
                        h-[47px]
                        w-full
                        max-w-[700px]
                        items-stretch
                        justify-center
                    "
                >
                    {weeks.map((week, index) => {
                        const isSelected =
                            activeWeekIndex === index;

                        return (
                            <button
                                type="button"
                                key={week.weekNumber}
                                onClick={() =>
                                    setSelectedWeek(index)
                                }
                                className={`
                                    flex
                                    h-[47px]
                                    flex-1
                                    basis-0
                                    items-center
                                    justify-center
                                    text-sm
                                    font-medium
                                    whitespace-nowrap
                                    bg-transparent
                                    transition-colors
                                    ${
                                        isSelected
                                            ? 'text-blue-600'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }
                                `}
                                style={{
                                    border: 'none',
                                    borderBottom: isSelected
                                        ? '2px solid #2563EB'
                                        : '2px solid transparent',
                                    marginBottom: '-1px',
                                    boxSizing: 'border-box',
                                }}
                            >
                                Week {week.weekNumber}
                            </button>
                        );
                    })}
                </div>
            </div>


            {/* =========================================================
                DAYS
            ========================================================== */}

            <div
                className="
                    mt-4
                    overflow-visible
                    rounded-xl
                    border
                    bg-white
                "
            >

                {selectedWeekData?.days.map(
                    (day) => (

                        <button
                            type="button"
                            key={day.date.toISOString()}
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

                            <div>

                                <p className="font-semibold">
                                    {day.dayName}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {day.formattedDate}
                                </p>

                            </div>

                            <ChevronRight
                                className="
                                    size-4
                                    shrink-0
                                    text-gray-400
                                "
                            />

                        </button>

                    )
                )}

            </div>


            {/* =========================================================
                SUBMIT
            ========================================================== */}

            <div className="mt-6 flex justify-end">

                <button
                    type="button"
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
                    Submit
                </button>

            </div>

        </div>
    );
}

Logbook.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);