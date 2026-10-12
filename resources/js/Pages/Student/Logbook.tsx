import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
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

interface InternshipPeriod {
    start_date: string;
    end_date: string;
}

interface MissingLogbookWeek {
    week_start: string;
    week_end: string;
}

interface Props {
    entries?: Record<string, LogbookEntryProp>;
    weeklySubmissions?: Record<string, WeeklySubmission>;
    missingLogbookWeeks?: MissingLogbookWeek[];
    internshipPeriod?: InternshipPeriod | null;
    isRecruited: boolean;
    today: string;
}

interface LogbookDay {
    date: Date;
    dayName: string;
    formattedDate: string;
}

interface LogbookWeek {
    weekNumber: number;
    weekStart: string;
    days: LogbookDay[];
}

type DayStatus =
    | 'not_set'
    | 'working'
    | 'off';

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
    missingLogbookWeeks = [],
    internshipPeriod = null,
    isRecruited = false,
    today: serverToday,
}: Props) {
    const page = usePage<any>();
    const { errors = {}, flash = {} } = page.props;
    const restrictionMessage = errors.date || errors.week || flash.error;

    useEffect(() => {
        if (missingLogbookWeeks.length === 0) return;

        toast.warning(`${missingLogbookWeeks.length} missing weekly logbook${missingLogbookWeeks.length === 1 ? '' : 's'}`, {
            id: 'student-missing-logbooks',
            duration: 10000,
            description: (
                <span className="font-semibold text-slate-900">
                    Submit your completed internship weeks: {' '}
                    {missingLogbookWeeks.slice(0, 4).map((week, index) => (
                        <span key={week.week_start}>
                            {index > 0 && ', '}
                            <Link href={route('student.logbook', { week: week.week_start })} className="font-bold text-blue-700 underline hover:text-blue-900">
                                Week of {new Date(`${week.week_start}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Link>
                        </span>
                    ))}
                    {missingLogbookWeeks.length > 4 && (
                        <>
                            {' '}and {missingLogbookWeeks.length - 4} more.{' '}
                            <Link href={route('student.logbook')} className="font-bold text-blue-700 underline hover:text-blue-900">
                                Open Logbook
                            </Link>
                        </>
                    )}
                </span>
            ),
            classNames: {
                description: '!text-slate-900 font-semibold',
            },
        });
    }, [missingLogbookWeeks]);

    const urlWeekStart = new URLSearchParams(page.url.split('?')[1] ?? '').get('week');
    const getDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDateRestriction = (dateKey: string): string | null => {
        if (!isRecruited) return 'Not recruited';
        if (!internshipPeriod) return 'Internship dates not set';
        if (dateKey < internshipPeriod.start_date) return 'Before internship period';
        if (dateKey > internshipPeriod.end_date) return 'After internship period';
        if (dateKey > serverToday) return 'Future date';
        return null;
    };

    const [selectedDateKey, setSelectedDateKey] =
        useState<string | null>(null);

    const [showDayPanel, setShowDayPanel] =
        useState(false);

    const [showReviewedSubmission, setShowReviewedSubmission] = useState(false);

    const [selectedStatus, setSelectedStatus] =
        useState<DayStatus>('not_set');

    // Keep calendar Monday keys so existing submissions and reminder links still match.
    const weeks = useMemo<LogbookWeek[]>(() => {
        if (!isRecruited || !internshipPeriod) return [];

        const startDate = new Date(`${internshipPeriod.start_date}T00:00:00`);
        const endDate = new Date(`${internshipPeriod.end_date}T00:00:00`);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) return [];

        const firstMonday = new Date(startDate);
        firstMonday.setDate(firstMonday.getDate() - ((firstMonday.getDay() + 6) % 7));
        const generatedWeeks: LogbookWeek[] = [];

        for (const weekStart = new Date(firstMonday); weekStart <= endDate; weekStart.setDate(weekStart.getDate() + 7)) {
            const days: LogbookDay[] = [];

            for (let offset = 0; offset < 7; offset++) {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + offset);
                if (date < startDate || date > endDate) continue;

                days.push({
                    date,
                    dayName: date.toLocaleDateString('en-GB', { weekday: 'long' }),
                    formattedDate: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                });
            }

            generatedWeeks.push({
                weekNumber: generatedWeeks.length + 1,
                weekStart: getDateKey(weekStart),
                days,
            });
        }

        return generatedWeeks;
    }, [isRecruited, internshipPeriod?.start_date, internshipPeriod?.end_date]);

    const initialWeekIndex = useMemo(() => {
        const requestedWeekIndex = weeks.findIndex((week) =>
            week.weekStart === urlWeekStart || week.days.some((day) => getDateKey(day.date) === urlWeekStart)
        );
        if (requestedWeekIndex >= 0) return requestedWeekIndex;

        const currentWeekIndex = weeks.findIndex((week) =>
            week.days.some((day) => getDateKey(day.date) === serverToday)
        );
        if (currentWeekIndex >= 0) return currentWeekIndex;

        // Before the internship use its first week; after it use its last week.
        return internshipPeriod && serverToday > internshipPeriod.end_date ? Math.max(0, weeks.length - 1) : 0;
    }, [weeks, urlWeekStart, serverToday, internshipPeriod?.end_date]);

    const initialWeekStart = weeks[initialWeekIndex]?.weekStart ?? null;
    const [selectedCalendarWeekStart, setSelectedCalendarWeekStart] = useState<string | null>(initialWeekStart);

    useEffect(() => {
        setSelectedCalendarWeekStart(initialWeekStart);
        setShowDayPanel(false);
        setShowReviewedSubmission(false);
        setSelectedDateKey(null);
    }, [initialWeekStart]);

    const matchingWeekIndex = weeks.findIndex((week) => week.weekStart === selectedCalendarWeekStart);
    const activeWeekIndex = matchingWeekIndex >= 0 ? matchingWeekIndex : initialWeekIndex;
    const selectedWeekData = weeks[activeWeekIndex];
    const visibleWeekStartIndex = Math.floor(activeWeekIndex / 5) * 5;
    const visibleWeeks = weeks.slice(visibleWeekStartIndex, visibleWeekStartIndex + 5);
    const selectedWeekEndDay = selectedWeekData?.days[selectedWeekData.days.length - 1];
    const selectedWeekRange = selectedWeekData
        ? `${selectedWeekData.days[0].formattedDate} – ${selectedWeekEndDay?.formattedDate}`
        : '';
    const hasStarted = Boolean(isRecruited && internshipPeriod && serverToday >= internshipPeriod.start_date);
    const waitingMessage = !isRecruited
        ? 'Your logbook will become available after recruitment and internship dates are assigned.'
        : !internshipPeriod
            ? 'Waiting for Company HR to set your internship dates.'
            : !hasStarted
                ? `Your internship starts on ${new Date(`${internshipPeriod.start_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Logbook entry will become available on that date.`
                : null;

    /*
    |--------------------------------------------------------------------------
    | Selected week submission
    |--------------------------------------------------------------------------
    */

    const selectedWeekStart = selectedWeekData?.weekStart ?? null;

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
        if (isWeekReviewed || getDateRestriction(key)) {
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
        if (isWeekReviewed || getDateRestriction(selectedDateKey)) {
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
        if (isWeekReviewed || getDateRestriction(selectedDateKey)) {
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

    const moveSelectedWeek = (weekOffset: number) => {
        const targetWeek = weeks[activeWeekIndex + weekOffset];
        if (targetWeek) setSelectedCalendarWeekStart(targetWeek.weekStart);
    };

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

    const applicableWeekDateKeys = selectedWeekData
        ? selectedWeekData.days
            .map((day) => getDateKey(day.date))
            .filter((dateKey) => internshipPeriod
                && dateKey >= internshipPeriod.start_date
                && dateKey <= internshipPeriod.end_date)
        : [];

    const elapsedWeekDateKeys = applicableWeekDateKeys.filter((dateKey) => dateKey <= serverToday);
    const completedDays = elapsedWeekDateKeys.filter((dateKey) => {
        const status = entries[dateKey]?.status;
        return status === 'working' || status === 'off';
    }).length;
    const expectedDays = applicableWeekDateKeys.length;
    const allApplicableDaysHaveOccurred = expectedDays > 0 && elapsedWeekDateKeys.length === expectedDays;
    const isWeekComplete = allApplicableDaysHaveOccurred && completedDays === expectedDays;

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

            {internshipPeriod && isRecruited && (
                <p className="mt-3 text-xs text-slate-500">
                    Internship period: {internshipPeriod.start_date} – {internshipPeriod.end_date}. Fill in each day only after it occurs and within this period.
                </p>
            )}

            {waitingMessage && (
                <div role="status" className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                    {waitingMessage}
                </div>
            )}

            {restrictionMessage && (
                <div role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {restrictionMessage}
                </div>
            )}

            {hasStarted && selectedWeekData && <>
                <div className="mt-8">
                    <div className="mx-auto flex w-full max-w-sm items-center gap-3">
                        <button
                            type="button"
                            onClick={() => moveSelectedWeek(-1)}
                            disabled={activeWeekIndex === 0}
                            aria-label="Previous internship week"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <div className="min-w-0 flex-1 text-center">
                            <p className="flex min-h-10 items-center justify-center gap-2 text-sm font-semibold">
                                <CalendarDays className="size-4 shrink-0" />
                                Week {selectedWeekData.weekNumber} of {weeks.length}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{selectedWeekRange}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => moveSelectedWeek(1)}
                            disabled={activeWeekIndex === weeks.length - 1}
                            aria-label="Next internship week"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex w-full border-b border-gray-200" role="group" aria-label="Internship weeks">
                    {visibleWeeks.map((week) => {
                        const isSelected = selectedWeekStart === week.weekStart;
                        return (
                            <button
                                type="button"
                                key={week.weekStart}
                                aria-pressed={isSelected}
                                onClick={() => setSelectedCalendarWeekStart(week.weekStart)}
                                className={`relative flex h-12 min-w-0 flex-1 items-center justify-center whitespace-nowrap px-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${isSelected ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Week {week.weekNumber}
                                {isSelected && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />}
                            </button>
                        );
                    })}
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
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        rounded-lg
                        border border-slate-200
                        bg-slate-100
                        px-4
                        py-3
                    "
                >
                    <div className="flex items-center gap-3">
                        <LockKeyhole className="size-5 shrink-0 text-slate-600" />
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Week reviewed and locked</p>
                            <p className="text-xs text-slate-600">This week has been reviewed by your Academic Supervisor and can no longer be edited.</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setShowReviewedSubmission(true)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                        View submitted logbook
                    </button>
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

                        const dateRestriction = getDateRestriction(getDateKey(day.date));
                        const dayIsFlagged = isDayFlagged(day);

                        return (
                            <button
                                type="button"
                                key={day.date.toISOString()}
                                onClick={() =>
                                    openDay(day)
                                }
                                disabled={isWeekReviewed || Boolean(dateRestriction)}
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
                                        isWeekReviewed || dateRestriction
                                            ? 'cursor-not-allowed bg-gray-50'
                                            : dayIsFlagged
                                                ? 'bg-rose-50 hover:bg-rose-100'
                                                : 'hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="min-w-0">

                                    <div className="flex items-center gap-2">

                                        <p className="font-semibold text-gray-900">
                                            {day.dayName}
                                        </p>

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
                                                text-slate-600
                                            "
                                        >
                                            <LockKeyhole className="size-4" />
                                            Locked
                                        </span>

                                    ) : dateRestriction ? (

                                        <span
                                            title={dateRestriction}
                                            className="flex items-center gap-1.5 text-sm font-medium text-slate-400"
                                        >
                                            <LockKeyhole className="size-4" />
                                            {dateRestriction === 'Future date' ? 'Future date' : 'Unavailable'}
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
                    <span className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600">
                        <LockKeyhole className="size-4" />
                        Reviewed & Locked
                    </span>
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

                {!isWeekReviewed && !isWeekPending && !isWeekSubmitted && expectedDays > 0 && !isWeekComplete && (
                    <p className="max-w-md text-right text-xs text-slate-500">
                        Complete the {expectedDays} internship day{expectedDays === 1 ? '' : 's'} in this week. Future dates become available when they arrive, and the week can be submitted after all applicable dates have passed.
                    </p>
                )}

            </div>

            <Dialog open={showReviewedSubmission} onOpenChange={setShowReviewedSubmission}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Reviewed weekly logbook</DialogTitle>
                        <DialogDescription>
                            {selectedWeekRange}
                            {selectedWeekSubmission?.reviewed_at && ` · Reviewed ${new Date(selectedWeekSubmission.reviewed_at).toLocaleString('en-GB')}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedWeekSubmission?.supervisor_feedback && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Academic Supervisor feedback</p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">{selectedWeekSubmission.supervisor_feedback}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {selectedWeekData?.days.map((day) => {
                            const entry = entries[getDateKey(day.date)];

                            return (
                                <section key={getDateKey(day.date)} className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-semibold text-slate-900">{day.dayName} · {day.formattedDate}</h3>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            {entry?.status === 'working' ? 'Working Day' : entry?.status === 'off' ? 'Off Day' : 'No saved entry'}
                                        </span>
                                    </div>

                                    {entry?.status === 'working' && (
                                        <div className="mt-4 space-y-3 text-sm">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Activities</p>
                                                <p className="mt-1 whitespace-pre-line text-slate-800">{entry.description || 'No activities entered.'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Learning outcomes</p>
                                                <p className="mt-1 whitespace-pre-line text-slate-800">{entry.learning_outcomes || 'No learning outcomes entered.'}</p>
                                            </div>
                                            {entry.issues && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Issues or support needed</p>
                                                    <p className="mt-1 whitespace-pre-line text-slate-800">{entry.issues}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>


            </>}

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
