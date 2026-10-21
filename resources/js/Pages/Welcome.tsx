import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, BriefcaseBusiness, ClipboardCheck, GraduationCap } from 'lucide-react';
import IndexLayout from '@/Layouts/IndexLayout';
import { buttonVariants } from '@/Components/ui/button';
import { PageProps, UserRole } from '@/types';

const portalRoutes: Record<UserRole, string> = {
    Admin: 'admin.dashboard',
    Student: 'student.dashboard',
    Company: 'company.dashboard',
    'Academic Supervisor': 'academic-supervisor.dashboard',
    'Industry Supervisor': 'industry-supervisor.dashboard',
};

const features = [
    {
        number: '01',
        icon: BriefcaseBusiness,
        title: 'Find your placement',
        description: 'Explore internship opportunities, apply with your profile and CV, and follow your application status.',
    },
    {
        number: '02',
        icon: BookOpen,
        title: 'Keep your logbook',
        description: 'Record your daily experience, submit weekly logs and receive feedback from your Industry Supervisor.',
    },
    {
        number: '03',
        icon: ClipboardCheck,
        title: 'Track your progress',
        description: 'Keep your reports and supervisor evaluations together as you work towards internship completion.',
    },
];

export default function Welcome({ auth }: PageProps) {
    const portalHref = auth.user
        ? route(portalRoutes[auth.user.role] ?? 'login')
        : route('login');

    return (
        <IndexLayout auth={auth}>
            <Head title="PBeyond — Politeknik Brunei">
                <meta
                    name="description"
                    content="PBeyond connects Politeknik Brunei students, industry partners and supervisors throughout the internship journey."
                />
            </Head>

            <section aria-labelledby="welcome-title" className="border-b border-primary/10 bg-primary/5">
                <div className="mx-auto grid w-full max-w-7xl items-center gap-9 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-14 lg:px-10">
                <div className="max-w-xl lg:py-8">
                    <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background px-3 py-1.5 text-xs font-semibold text-primary sm:text-sm">
                        <GraduationCap size={16} aria-hidden="true" />
                        Politeknik Brunei
                    </p>
                    <h1 id="welcome-title" className="text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        From campus to<br className="hidden sm:block" /> <span className="text-primary">your next chapter.</span>
                    </h1>
                    <p className="mt-5 max-w-[28rem] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                        Your internship journey, connected. Apply for opportunities, record your experience and stay on track with PBeyond.
                    </p>
                    <div className="mt-7">
                        <Link
                            href={portalHref}
                            className={buttonVariants({ size: 'lg' })}
                        >
                            {auth.user ? 'Go to your dashboard' : 'Log in to PBeyond'}
                            <ArrowRight size={17} aria-hidden="true" />
                        </Link>
                        <p className="mt-4 text-xs leading-5 text-muted-foreground sm:text-sm">For students, industry partners and supervisors.</p>
                    </div>
                </div>

                <figure className="ui-card min-w-0 overflow-hidden border-primary/15">
                    <img
                        src="/images/pb-campus.jpg"
                        alt="Politeknik Brunei's Ong Sum Ping campus building, surrounded by trees."
                        width={1280}
                        height={1716}
                        fetchPriority="high"
                        className="aspect-[5/4] w-full object-cover object-top sm:aspect-[4/3] lg:aspect-auto lg:h-[400px]"
                    />
                    <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background px-4 py-3 text-[11px] leading-5 text-muted-foreground">
                        <span className="font-medium text-foreground">Ong Sum Ping Campus</span>
                    </figcaption>
                </figure>
                </div>
            </section>

            <section aria-labelledby="features-title" className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-10 lg:px-10">
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="features-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Every step, connected.</h2>
                    <p className="text-sm text-muted-foreground">Your internship essentials, in one place.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {features.map(({ number, icon: Icon, title, description }) => (
                        <article key={number} className="ui-card border-primary/15 p-5 sm:p-6">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                                </span>
                                <span className="text-xs font-semibold tracking-wider text-primary/60" aria-hidden="true">{number}</span>
                            </div>
                            <h3 className="text-base font-semibold text-foreground">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                        </article>
                    ))}
                </div>
            </section>
        </IndexLayout>
    );
}
