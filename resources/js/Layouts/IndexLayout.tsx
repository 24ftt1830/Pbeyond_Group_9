import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect, useRef } from 'react';
import { DitherShader } from '@/Components/ui/dither-shader';
import LenisProvider from '@/Components/providers/lenis-provider';

const FOOTER_HEIGHT = 500;

const links = [
    {
        group: 'Product',
        items: [
            { title: 'Features', href: '#' },
            { title: 'Solution', href: '#' },
        ],
    },
    {
        group: 'Company',
        items: [
            { title: 'About', href: '#' },
            { title: 'Licence', href: '#' },
            { title: 'Privacy', href: '#' },
            { title: 'Cookies', href: '#' },
        ],
    },
];

export default function IndexLayout({ auth, children }: PropsWithChildren<PageProps>) {
    const getDashboardRoute = () => {
        if (!auth.user) return route('login');
        const role = auth.user.role as 'Admin' | 'Student' | 'Company';
        switch (role) {
            case 'Admin': return route('admin.dashboard');
            case 'Student': return route('student.dashboard');
            case 'Company': return route('company.dashboard');
        }
    };

    const navRef = useRef<HTMLElement>(null);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const nav = navRef.current;
            if (!nav) return;

            if (currentY < lastScrollY.current || currentY < 60) {
                nav.classList.remove('-translate-y-full', 'opacity-0');
                nav.classList.add('translate-y-0', 'opacity-100');
            } else {
                nav.classList.remove('translate-y-0', 'opacity-100');
                nav.classList.add('-translate-y-full', 'opacity-0');
            }

            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <LenisProvider>
            <div className="relative bg-primary">

                {/* Navbar */}
                <header
                    ref={navRef}
                    className="fixed top-0 left-0 right-0 z-50 translate-y-0 opacity-100 transition-all duration-500 ease-in-out"
                >
                    <div className="mx-4 mt-4">
                        <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/10 shadow-sm">

                            {/* Logo */}
                            <span className="font-sato font-bold text-lg text-white tracking-tight">
                                PBeyond
                            </span>

                            {/* Nav links */}
                            <nav className="hidden md:flex items-center gap-8">
                                {['Product', 'About', 'Contact'].map((item) => (
                                    <a
                                        key={item}
                                        href="#"
                                        className="text-sm text-white hover:text-zinc-900 transition-colors duration-150"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </nav>

                            {/* Auth */}
                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={getDashboardRoute()}
                                        className="text-sm px-4 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 transition-colors duration-150"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="text-sm px-4 py-1.5 bg-white uppercase hover:bg-zinc-700 transition-colors duration-150"
                                    >
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Footer behind everything */}
                <div className="fixed bottom-0 w-full" style={{ height: `${FOOTER_HEIGHT}px` }}>
                    <footer className="relative h-full w-full overflow-hidden">
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
                        <div className="relative z-[99] flex h-full flex-col justify-between text-white pl-10 pt-10 pb-8 pr-10">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-6">
                                    <h2 className="font-sato text-7xl text-white/90 font-bold">PBeyond</h2>
                                    <div className="pt-4">
                                        <p className="text-lg font-sato text-white">Subscribe to our emails</p>
                                        <div className="flex items-center border-b border-white/40 pb-1 w-72">
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                className="flex-1 bg-transparent text-sm border-transparent text-white placeholder:text-white/40 outline-none focus:ring-0 focus:border-transparent"
                                            />
                                            <button type="submit" aria-label="Subscribe" className="text-white/60 hover:text-white transition-colors duration-150">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-12 mr-8">
                                    {links.map((link, i) => (
                                        <div key={i} className="space-y-3">
                                            <span className="block text-md font-semibold font-sato text-white">{link.group}</span>
                                            <div className="flex flex-col gap-2">
                                                {link.items.map((item, j) => (
                                                    <Link key={j} href={item.href} className="text-sm text-white/70 hover:text-white transition-colors duration-150">
                                                        {item.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-5 mb-2 mr-8">
                                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="X/Twitter" className="text-white/70 hover:text-white transition-colors duration-150">
                                    <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z" />
                                    </svg>
                                </a>
                                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/70 hover:text-white transition-colors duration-150">
                                    <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Main content */}
                <main
                    className="z-10 min-h-screen bg-white rounded-b-[2rem]"
                    style={{ marginBottom: `${FOOTER_HEIGHT}px` }}
                >
                    {/* Spacer so content clears the fixed navbar */}
                    <div/>
                    {children}
                </main>

            </div>
        </LenisProvider>
    );
}