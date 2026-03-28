import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Bell, Building2, FileText, CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';

export default function Dashboard() {
    const { auth, recentApplications, recommendedCompanies, reminders, upcomingEvents } = usePage<PageProps>().props;

    // Get the last application (if any)
    const lastApplication = recentApplications && recentApplications.length > 0 ? recentApplications[0] : null;

    // Helper to determine step index for the last application
    const getStepIndex = (status: string) => {
        const steps = ['Pending', 'Reviewing', 'Approved', 'Rejected', 'Accepted'];
        const idx = steps.indexOf(status);
        return idx !== -1 ? idx : 0;
    };

    const steps = ['Applied', 'ILD Review', 'Company', 'Review', 'Result'];
    const currentStepIndex = lastApplication ? getStepIndex(lastApplication.status) : -1;

    // Mini-calendar component
    const MiniCalendar = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const startWeekday = firstDayOfMonth.getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const calendarDays = [];
        for (let i = 0; i < startWeekday; i++) calendarDays.push(null);
        for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
        while (calendarDays.length % 7 !== 0) calendarDays.push(null);

        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        return (
            <div className="text-center">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {today.toLocaleString('default', { month: 'long' })} {currentYear}
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-zinc-500">
                    {weekDays.map((day, i) => (
                        <div key={i} className="text-center font-medium">{day}</div>
                    ))}
                    {calendarDays.map((day, idx) => (
                        <div
                            key={idx}
                            className={`text-center py-1 rounded-full ${
                                day === today.getDate()
                                    ? 'bg-blue-500 text-white font-bold'
                                    : day ? 'text-zinc-700 dark:text-zinc-300' : ''
                            }`}
                        >
                            {day || ''}
                        </div>
                    ))}
                </div>
                {upcomingEvents && upcomingEvents.length > 0 && (
                    <div className="mt-3 text-xs text-zinc-500 border-t pt-2">
                        <div className="font-medium mb-1">Upcoming</div>
                        {upcomingEvents.slice(0, 2).map((event, i) => (
                            <div key={i} className="flex justify-between text-xs">
                                <span>{event.title}</span>
                                <span>{event.date}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 pt-8">
            {/* Hero Banner – Student specific */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-white/5">
                <div className="relative z-20 p-8 flex flex-col justify-between min-h-[200px]">
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {new Date().toLocaleDateString('en-GB')}
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                            Welcome, {auth.user.name}!
                        </h1>
                        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                            Your Internship Journey Starts Here
                        </p>
                    </div>
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[65%] z-10">
                    <img
                        src="/student/banner.png"
                        alt="Student internship"
                        className="h-full w-full object-cover object-right opacity-90 dark:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r
                        from-zinc-100 via-zinc-100/60 to-transparent
                        dark:from-zinc-950 dark:via-zinc-950/60"
                    />
                </div>
            </div>

            {/* First row of cards (existing) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reminders Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-zinc-500" />
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Reminders
                            </h2>
                        </div>
                    </div>
                    <div className="p-5">
                        {reminders && reminders.length > 0 ? (
                            <ul className="space-y-3">
                                {reminders.map((reminder, idx) => (
                                    <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                                        {reminder}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No reminders at the moment.
                            </p>
                        )}
                    </div>
                </div>

                {/* Recommended Companies Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-zinc-500" />
                            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                Recommended Companies
                            </h2>
                        </div>
                    </div>
                    <div className="p-5">
                        {recommendedCompanies && recommendedCompanies.length > 0 ? (
                            <ul className="space-y-3">
                                {recommendedCompanies.map((company) => (
                                    <li key={company.id}>
                                        <Link
                                            href={route('student.companies.view', company.id)}
                                            className="block group"
                                        >
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                                                {company.name}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                {company.job_title}
                                            </div>
                                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                {company.slots} slot{company.slots !== 1 ? 's' : ''} available
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No recommendations at the moment.
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Applications Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-zinc-500" />
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                    Recent Applications
                                </h2>
                            </div>
                            {recentApplications && recentApplications.length > 0 && (
                                <Link
                                    href={route('student.application-tracking')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    View all
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="p-5">
                        {recentApplications && recentApplications.length > 0 ? (
                            <div className="space-y-4">
                                {recentApplications.map((app) => (
                                    <div key={app.id} className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                                {app.company}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                Applied on {app.applied_at}
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                app.status === 'Approved'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : app.status === 'Rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No applications yet. Start applying to companies!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Second row: Application Tracking Preview & Calendar Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Application Tracking Preview */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-zinc-500" />
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                    Application Progress
                                </h2>
                            </div>
                            {lastApplication && (
                                <Link
                                    href={route('student.application-tracking')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Details
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="p-5">
                        {lastApplication ? (
                            <>
                                <div className="mb-3">
                                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                        {lastApplication.company}
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-0.5">
                                        Status: <span className={`font-medium ${
                                            lastApplication.status === 'Approved' ? 'text-green-600' :
                                            lastApplication.status === 'Rejected' ? 'text-red-600' :
                                            'text-yellow-600'
                                        }`}>{lastApplication.status}</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="flex justify-between mb-1">
                                        {steps.map((step, idx) => (
                                            <div key={step} className="text-[10px] text-zinc-400 text-center w-1/5">
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                                            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-right text-[10px] text-zinc-400 mt-1">
                                        Step {currentStepIndex + 1} of {steps.length}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                No applications yet. Start applying to see your progress!
                            </p>
                        )}
                    </div>
                </div>

                {/* Calendar Preview */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-zinc-500" />
                                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                    Calendar
                                </h2>
                            </div>
                            <Link
                                href={route('student.calendar')}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Full view
                            </Link>
                        </div>
                    </div>
                    <div className="p-5">
                        <MiniCalendar />
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
