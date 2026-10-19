import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
    ArrowRight,
    BookOpen,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    FileText,
} from 'lucide-react';

interface Application {
    id: number;
    app_status: string;
    created_at: string;
    job_title?: string;
    company_name?: string;
}

interface MissingLogbookWeek {
    week_start: string;
    week_end: string;
}

interface InternshipSummary {
    start_date: string;
    end_date: string;
    phase: 'upcoming' | 'active' | 'ended';
}

interface Props {
    studentName: string;
    profileComplete: boolean;
    cvGenerated: boolean;
    recentApplications: Application[];
    missingLogbookWeeks?: MissingLogbookWeek[];
    internship: InternshipSummary | null;
    stats: {
        open_positions: number;
        available_slots: number;
        applications: number;
        active_applications: number;
        recruited_applications: number;
    };
}

const statusClass = (status: string) => {
    if (status === 'Recruited') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    if (status === 'Declined') return 'bg-slate-100 text-slate-600 ring-slate-200';
    if (status === 'Interviewing') return 'bg-blue-50 text-blue-700 ring-blue-100';
    if (status === 'Waitlisted') return 'bg-violet-50 text-violet-700 ring-violet-100';
    return 'bg-amber-50 text-amber-700 ring-amber-100';
};

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export default function Dashboard({
    studentName,
    profileComplete,
    cvGenerated,
    recentApplications = [],
    missingLogbookWeeks = [],
    internship,
    stats,
}: Props) {
    const safeStats = stats ?? {
        open_positions: 0,
        available_slots: 0,
        applications: 0,
        active_applications: 0,
        recruited_applications: 0,
    };

    useEffect(() => {
        if (missingLogbookWeeks.length === 0) return;

        toast.warning(`${missingLogbookWeeks.length} missing weekly logbook${missingLogbookWeeks.length === 1 ? '' : 's'}`, {
            id: 'student-missing-logbooks',
            duration: 10000,
            description: (
                <span className="font-semibold text-slate-900">
                    Submit your completed internship weeks:{' '}
                    {missingLogbookWeeks.slice(0, 4).map((week, index) => (
                        <span key={week.week_start}>
                            {index > 0 && ', '}
                            <Link href={route('student.logbook', { week: week.week_start })} className="font-bold text-blue-700 underline hover:text-blue-900">
                                Week of {formatDate(week.week_start)}
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

    const nextStep = (() => {
        if (internship || safeStats.recruited_applications > 0) {
            if (missingLogbookWeeks.length > 0) {
                const firstMissingWeek = missingLogbookWeeks[0];
                return {
                    stage: 'Internship in progress',
                    title: 'Submit your missing logbook week',
                    description: `You have ${missingLogbookWeeks.length} completed internship week${missingLogbookWeeks.length === 1 ? '' : 's'} to submit.`,
                    action: 'Open logbook',
                    href: route('student.logbook', { week: firstMissingWeek.week_start }),
                    icon: BookOpen,
                };
            }

            if (internship?.phase === 'upcoming') {
                return {
                    stage: 'Internship starts soon',
                    title: 'Your internship dates are set',
                    description: `${formatDate(internship.start_date)} – ${formatDate(internship.end_date)}. You can view your logbook weeks before the internship begins.`,
                    action: 'View logbook',
                    href: route('student.logbook'),
                    icon: CalendarDays,
                };
            }

            if (internship?.phase === 'active') {
                return {
                    stage: 'Internship in progress',
                    title: 'Keep your logbook up to date',
                    description: `${formatDate(internship.start_date)} – ${formatDate(internship.end_date)}. Record each day after it occurs.`,
                    action: 'Open logbook',
                    href: route('student.logbook'),
                    icon: BookOpen,
                };
            }

            if (internship?.phase === 'ended') {
                return {
                    stage: 'Internship period ended',
                    title: 'Continue to your written report',
                    description: 'Open your report page to submit or review your written report.',
                    action: 'Open written report',
                    href: route('student.final-report'),
                    icon: FileText,
                };
            }

            return {
                stage: 'Recruited',
                title: 'Your internship dates are not set yet',
                description: 'Your company will confirm the internship period after recruitment.',
                action: 'Track application',
                href: route('student.application-tracking'),
                icon: ClipboardList,
            };
        }

        if (safeStats.active_applications > 0) {
            return {
                stage: 'Applications in review',
                title: 'Check your application updates',
                description: `You have ${safeStats.active_applications} active application${safeStats.active_applications === 1 ? '' : 's'} to track.`,
                action: 'Track applications',
                href: route('student.application-tracking'),
                icon: ClipboardList,
            };
        }

        if (!profileComplete) {
            return {
                stage: 'Get ready to apply',
                title: 'Complete your student profile',
                description: 'Fill in the required profile details before applying for an internship.',
                action: 'Complete profile',
                href: route('student.profile'),
                icon: CheckCircle2,
            };
        }

        if (!cvGenerated) {
            return {
                stage: 'Get ready to apply',
                title: 'Generate your CV',
                description: 'Your profile is ready. Generate your CV to apply for available positions.',
                action: 'Open profile',
                href: route('student.profile'),
                icon: FileText,
            };
        }

        return {
            stage: 'Explore opportunities',
            title: safeStats.available_slots > 0 ? 'Find an internship that suits you' : 'You are ready to apply',
            description: safeStats.available_slots > 0
                ? `${safeStats.available_slots} opening${safeStats.available_slots === 1 ? '' : 's'} available across approved positions.`
                : 'Browse approved internship positions and check back for new openings.',
            action: 'Browse positions',
            href: route('student.companies'),
            icon: BriefcaseBusiness,
        };
    })();

    const NextStepIcon = nextStep.icon;
    const internshipStatus = internship
        ? internship.phase === 'upcoming'
            ? 'Starts soon'
            : internship.phase === 'active'
                ? 'In progress'
                : 'Period ended'
        : safeStats.recruited_applications > 0
            ? 'Dates not set'
            : 'Not started';

    const internshipDetail = internship
        ? `${formatDate(internship.start_date)} – ${formatDate(internship.end_date)}`
        : safeStats.recruited_applications > 0
            ? 'Waiting for your company to set the dates'
            : 'Dates appear here after recruitment';

    const progressLabel = internship ? 'Logbook' : 'Open positions';
    const progressValue = internship
        ? missingLogbookWeeks.length > 0
            ? `${missingLogbookWeeks.length} due`
            : 'Up to date'
        : safeStats.available_slots;
    const progressDetail = internship
        ? missingLogbookWeeks.length > 0
            ? 'Completed weeks still need submission'
            : 'Your weekly entries are current'
        : `${safeStats.open_positions} position${safeStats.open_positions === 1 ? '' : 's'} accepting applications`;

    const summaryCards = [
        {
            label: 'Applications',
            value: safeStats.applications,
            detail: `${safeStats.active_applications} active · ${safeStats.recruited_applications} recruited`,
            icon: ClipboardList,
        },
        {
            label: 'Internship',
            value: internshipStatus,
            detail: internshipDetail,
            icon: CalendarDays,
        },
        {
            label: progressLabel,
            value: progressValue,
            detail: progressDetail,
            icon: internship ? BookOpen : BriefcaseBusiness,
        },
    ];

    return (
        <>
            <Head title="Student Dashboard" />
            <main className="min-h-full bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Welcome back, {studentName}. Here is your internship progress and next step.
                        </p>
                    </header>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                    <NextStepIcon className="size-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{nextStep.stage}</p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{nextStep.title}</h2>
                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{nextStep.description}</p>
                                </div>
                            </div>
                            <Link
                                href={nextStep.href}
                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                            >
                                {nextStep.action}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>

                    <section aria-label="Student status" className="grid gap-4 md:grid-cols-3">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                            <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                                        </div>
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                            <Icon className="size-5" />
                                        </span>
                                    </div>
                                    <p className="mt-3 text-xs leading-5 text-slate-500">{card.detail}</p>
                                </article>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2 className="font-semibold text-slate-900">Recent applications</h2>
                                <p className="mt-1 text-sm text-slate-500">A quick view of your latest application activity.</p>
                            </div>
                            <Link href={route('student.application-tracking')} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
                                View all applications
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        {recentApplications.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="text-sm text-slate-600">Your applications will appear here once you apply.</p>
                                <Link href={route('student.companies')} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
                                    Browse positions
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentApplications.slice(0, 3).map((application) => (
                                    <div key={application.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{application.job_title ?? 'Position'}</p>
                                            <p className="mt-1 truncate text-sm text-slate-500">
                                                {application.company_name ?? 'Company'} · Applied {formatDate(application.created_at)}
                                            </p>
                                        </div>
                                        <span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(application.app_status)}`}>
                                            {application.app_status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;
