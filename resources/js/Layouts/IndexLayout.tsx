import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

// Adjusting the footer height here so you can easily change it later
const FOOTER_HEIGHT = 500; 

export default function IndexLayout({
    auth,
    children,
}: PropsWithChildren<PageProps>) {
    return (
        <div className="relative">
            {/* 1. Main Content Wrapper */}
            {/* z-10 ensures this sits ON TOP of the footer */}
            <main className="relative z-10 bg-gray-50 dark:bg-black min-h-screen">
                <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl mx-auto">
                    <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                        <nav className="-mx-3 flex flex-1 justify-end">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="rounded-md px-3 py-2 text-black transition hover:text-black/70 dark:text-white dark:hover:text-white/80">
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

            {/* 2. Sticky Footer Reveal Layer */}
            {/* This container pushes the footer down and handles the clipping */}
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
                    <footer className="h-full bg-primary text-white flex items-center justify-center">
                        <p>...!</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}