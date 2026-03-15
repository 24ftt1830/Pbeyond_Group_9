import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react'
import { PageProps } from '@/types'

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="relative mt-4 min-h-[200px] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-white/5">
            <div className="relative z-20 p-8 flex flex-col justify-between h-full min-h-[200px]">
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {new Date().toLocaleDateString('en-GB')}
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                        Welcome, {auth.user.name}!
                    </h1>
                    <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                        Bridging Education and Industry
                    </p>
                </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[65%] z-10">
                <img
                    src="/company/banner.png"
                    alt="Office Layout"
                    className="h-full w-full object-cover object-right opacity-90 dark:opacity-80"
                />
                
                <div className="absolute inset-0 bg-gradient-to-r 
                    from-zinc-100 via-zinc-100/60 to-transparent 
                    dark:from-zinc-950 dark:via-zinc-950/60" 
                />
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;