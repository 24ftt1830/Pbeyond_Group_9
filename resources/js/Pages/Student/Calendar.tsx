import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export default function Calendar() {
    const [activeMonth, setActiveMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const today = new Date();

    const monthLabel = useMemo(() => {
        return activeMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }, [activeMonth]);

    const weeks = useMemo(() => {
        const startOfMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth(), 1);
        const endOfMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 0);
        const startDay = startOfMonth.getDay();
        const totalDays = endOfMonth.getDate();

        const days: Array<{ date: number; isCurrentMonth: boolean }> = [];
        for (let i = 0; i < startDay; i += 1) {
            days.push({ date: 0, isCurrentMonth: false });
        }
        for (let day = 1; day <= totalDays; day += 1) {
            days.push({ date: day, isCurrentMonth: true });
        }
        while (days.length % 7 !== 0) {
            days.push({ date: 0, isCurrentMonth: false });
        }

        const rows: typeof days[] = [];
        for (let i = 0; i < days.length; i += 7) {
            rows.push(days.slice(i, i + 7));
        }
        return rows;
    }, [activeMonth]);

    const handlePrevMonth = () => {
        setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="rounded-md border px-3 py-2 text-sm"
                    aria-label="Previous month"
                >
                    &lt;
                </button>
                <h1 className="text-2xl font-bold">{monthLabel}</h1>
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="rounded-md border px-3 py-2 text-sm"
                    aria-label="Next month"
                >
                    &gt;
                </button>
            </div>

            <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
                <div className="bg-[#D9D9D9] py-2">Sun</div>
                <div className="bg-[#D9D9D9] py-2">Mon</div>
                <div className="bg-[#D9D9D9] py-2">Tue</div>
                <div className="bg-[#D9D9D9] py-2">Wed</div>
                <div className="bg-[#D9D9D9] py-2">Thu</div>
                <div className="bg-[#D9D9D9] py-2">Fri</div>
                <div className="bg-[#D9D9D9] py-2">Sat</div>
            </div>

            <div className="mt-2 grid grid-cols-7 border border-muted">
                {weeks.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="contents">
                        {week.map((day, dayIndex) => {
                            const isLastColumn = dayIndex === 6;
                            const isLastRow = weekIndex === weeks.length - 1;
                            const isToday =
                                day.isCurrentMonth &&
                                day.date === today.getDate() &&
                                activeMonth.getMonth() === today.getMonth() &&
                                activeMonth.getFullYear() === today.getFullYear();
                            return (
                                <div
                                    key={`day-${weekIndex}-${dayIndex}`}
                                    className={`flex aspect-square items-center justify-center text-sm border-muted border-r border-b ${
                                        isLastColumn ? 'border-r-0' : ''
                                    } ${isLastRow ? 'border-b-0' : ''} ${
                                        day.isCurrentMonth ? '' : 'text-muted-foreground'
                                    }`}
                                >
                                    {day.date === 0 ? (
                                        ''
                                    ) : (
                                        <span
                                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                                                isToday ? 'bg-primary text-primary-foreground font-semibold' : ''
                                            }`}
                                        >
                                            {day.date}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

Calendar.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
