import { buttonVariants } from '@/Components/ui/button';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function IndexLayout({ auth, children }: PropsWithChildren<PageProps>) {
    const dashboardRoutes = {
        Admin: 'admin.dashboard',
        Student: 'student.dashboard',
        Company: 'company.dashboard',
        'Academic Supervisor': 'academic-supervisor.dashboard',
        'Industry Supervisor': 'industry-supervisor.dashboard',
    } as const;
    const destination = auth.user
        ? route(dashboardRoutes[auth.user.role] ?? 'login')
        : route('login');

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-foreground antialiased">
            <a
                href="#main-content"
                className="sr-only z-[70] rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
                Skip to content
            </a>

            <header className="border-b border-border border-t-[3px] border-t-primary bg-background">
                <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-5 py-4 sm:gap-8 sm:px-8 lg:px-10">
                    <Link
                        href="/"
                        aria-label="PBeyond, Politeknik Brunei home"
                        className="flex min-w-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-4 sm:gap-5"
                    >
                        <img
                            src="/politeknik/pb-logo-black.png"
                            alt="Politeknik Brunei"
                            className="h-10 w-16 object-contain sm:h-12 sm:w-32"
                        />
                        <span className="flex items-center gap-1.5 border-l border-border py-1 pl-2 text-[15px] font-semibold tracking-tight text-foreground sm:gap-2 sm:pl-5 sm:text-xl">
                            <img
                                src="/images/pb-secondary-logo.png"
                                alt=""
                                className="size-5 shrink-0 object-contain sm:size-6"
                            />
                            <span>PBeyond</span>
                        </span>
                    </Link>

                    <Link
                        href={destination}
                        className={buttonVariants({ className: 'shrink-0 px-3 sm:px-4' })}
                    >
                        {auth.user ? 'Dashboard' : 'Log in'}
                        <ArrowUpRight className="hidden size-4 sm:block" aria-hidden="true" />
                    </Link>
                </div>
            </header>

            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {children}
            </main>

            <footer className="border-t border-border bg-background">
                <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                    <p className="font-semibold">
                        PBeyond
                        <span className="ml-3 border-l border-border pl-3 font-normal text-muted-foreground">
                            Politeknik Brunei
                        </span>
                    </p>
                    <p className="text-muted-foreground">
                        Internship management, from application to completion.
                    </p>
                </div>
            </footer>
        </div>
    );
}
