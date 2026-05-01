import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build calendar grid (42 cells: 6 rows × 7 days)
    const calendarDays = useMemo(() => {
        const days = [];
        // Previous month's trailing days
        const prevMonthDays = firstDayOfMonth;
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({ date, isCurrentMonth: true });
        }
        // Next month's leading days to fill 42 cells
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false });
        }
        return days;
    }, [year, month, firstDayOfMonth, daysInMonth]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const goPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Calendar</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goPrevMonth}
                        className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-lg font-semibold text-gray-800 w-40 text-center">
                        {monthName} {year}
                    </span>
                    <button
                        onClick={goNextMonth}
                        className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 auto-rows-min">
                    {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                        const isToday = date.toDateString() === today.toDateString();
                        const dayNumber = date.getDate();
                        return (
                            <div
                                key={idx}
                                className={`min-h-[100px] p-2 border-b border-r border-gray-100 ${
                                    !isCurrentMonth ? 'bg-gray-50/30 text-gray-400' : 'text-gray-700'
                                } ${isToday ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex justify-end">
                                    <span
                                        className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                                            isToday ? 'bg-blue-600 text-white font-semibold' : ''
                                        }`}
                                    >
                                        {dayNumber}
                                    </span>
                                </div>
                                {/* Optional: display events here later */}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 text-center">
                * Click on a date to view details (future feature)
            </div>
        </div>
    );
}

Calendar.layout = (page:React.ReactNode) => <AuthenticatedLayout children={page} />;
