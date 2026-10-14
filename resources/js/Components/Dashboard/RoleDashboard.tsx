import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardStat {
    label: string;
    value: string | number;
    detail: string;
    icon: LucideIcon;
    href?: string;
}

export function RoleDashboard({
    title,
    description,
    stats,
    headerAction,
    children,
}: {
    title: string;
    description: string;
    stats: DashboardStat[];
    headerAction?: ReactNode;
    children: ReactNode;
}) {
    return (
        <>
            <Head title={`${title} Dashboard`} />
            <main className="min-h-full bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Dashboard
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">{description}</p>
                        </div>
                        {headerAction}
                    </header>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            const content = (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                                        </div>
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                            <Icon className="size-5" />
                                        </span>
                                    </div>
                                    <p className="mt-3 text-xs leading-5 text-slate-500">{stat.detail}</p>
                                </>
                            );

                            return stat.href ? (
                                <Link
                                    key={stat.label}
                                    href={stat.href}
                                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    {content}
                                </Link>
                            ) : (
                                <article
                                    key={stat.label}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    {content}
                                </article>
                            );
                        })}
                    </section>

                    {children}
                </div>
            </main>
        </>
    );
}

export function DashboardPanel({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h2 className="font-semibold text-slate-900">{title}</h2>
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function DashboardEmptyState({ message }: { message: string }) {
    return <p className="px-6 py-10 text-center text-sm text-slate-500">{message}</p>;
}
