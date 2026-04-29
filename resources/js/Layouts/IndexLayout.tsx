import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { DitherShader } from '@/Components/ui/dither-shader';

const FOOTER_HEIGHT = 500;

export default function IndexLayout({
    auth,
    children,
}: PropsWithChildren<PageProps>) {
    const getDashboardRoute = () => {
        if (!auth.user) return route('login');

        const role = auth.user.role as 'Admin' | 'Student' | 'Company';
        switch (role) {
            case 'Admin':
                return route('admin.dashboard');
            case 'Student':
                return route('student.dashboard');
            case 'Company':
                return route('company.dashboard');
        }
    };

    return (
        <div className="relative">
            {/* z-10 ensures this sits ON TOP of the footer */}
            <main className="relative z-10 min-h-screen">
                <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl mx-auto">
                    <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                        <nav className="-mx-3 flex flex-1 justify-end">
                            {auth.user ? (
                                <Link href={getDashboardRoute()} className="rounded-md px-3 py-2 text-black transition hover:text-black/70 dark:text-white dark:hover:text-white/80">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-md px-3 py-2 text-black transition hover:text-black/70 dark:text-white dark:hover:text-white/80">
                                        Log in
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Page Content */}
                    {children}
                </div>
            </main>

            <div
                className="relative"
                style={{
                    height: `${FOOTER_HEIGHT}px`,
                    clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)"
                }}
            >
                <div
                    className="fixed bottom-0 w-full"
                    style={{ height: `${FOOTER_HEIGHT}px` }}
                >
                    <footer className="relative h-full w-full overflow-hidden">

                        {/* LAYER 1: The Base (Shader) */}
                        <div className="absolute inset-0 z-0">
                            <DitherShader
                                src="/images/pbeyond-two.png"
                                gridSize={2}
                                ditherMode="bayer"
                                colorMode="duotone"
                                primaryColor="#f5f5f5"
                                secondaryColor="#214cf1"
                                threshold={0.6}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}