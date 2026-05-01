import { PageProps } from '@/types';
import IndexLayout from '@/Layouts/IndexLayout';
import FeaturesSection from '@/Components/features-section';
import { DitherShader } from '@/Components/ui/dither-shader';
import FollowCursor from '@/Components/follow-cursor';

const stickyItems = [
    {
        number: '01',
        cursorLabel: '✦ explore this',
        label: 'Discover',
        heading: 'The platform for unifying aspirations and opportunities.',
        body: 'Access a curated network of industry partners actively looking for emerging talent — all through a single, intuitive portal built for academic institutions.',
    },
    {
        number: '02',
        cursorLabel: '■ look at this',
        label: 'Connect',
        heading: 'Direct lines between talent and the people who matter.',
        body: 'No middlemen, no friction. Students and company representatives communicate directly, making the process faster and more human.',
    },
    {
        number: '03',
        cursorLabel: 'cool, right?',
        label: 'Succeed',
        heading: 'Every milestone, tracked with precision.',
        body: 'From initial applications to confirmed placements, PBeyond gives both sides full visibility into the journey — start to finish.',
    },
];

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <IndexLayout auth={auth}>
            <section className="sticky top-0 flex flex-col overflow-hidden h-screen bg-primary">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="w-full h-full translate-x-1/4">
                        <DitherShader
                            src="/images/hand.png"
                            gridSize={2}
                            ditherMode="bayer"
                            colorMode="duotone"
                            primaryColor="#214cf1"
                            secondaryColor="#ffffff"
                            threshold={0.6}
                            className="w-full h-full"
                        />
                    </div>
                </div>
                <div className="relative z-10 mt-auto px-10 pb-12 max-w-3xl">
                    <img
                        src="/images/pb-pixel.svg"
                        alt="PBeyond mark"
                        className="w-12 mb-4"
                    />
                    <h1 className="text-6xl font-sato font-bold text-white">
                        Everything Beyond, Within Reach.
                    </h1>
                    <p className="mt-4 text-xl text-zinc-300 max-w-2xl">
                        A high-performance ecosystem bridging the gap between
                        top-tier talent and industry leaders.
                    </p>
                </div>
            </section>

            {/* Card that slides over the sticky hero */}
            <div className="relative z-10">

                {/* Text Section */}
                <section className="bg-white rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] px-16 py-24">
                    <h2 className="text-5xl font-sato font-semibold text-zinc-900 leading-tight max-w-5xl mx-auto">
                        The platform for unifying aspirations and opportunities.
                    </h2>
                </section>

                {/* Features Section */}
                <section className="bg-white px-16 pb-24">
                    <FeaturesSection />
                </section>

                {/* Sticky Scroll Section */}
                <section className="bg-white px-16 py-24">
                    <div className="relative flex max-w-6xl mx-auto gap-24">

                        <div className="sticky top-28 h-fit w-1/3 shrink-0">
                            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">The Process</p>
                            <h2 className="text-3xl font-sato font-semibold text-zinc-900 leading-tight">
                                From campus to career,<br />every step covered.
                            </h2>
                            <p className="mt-4 text-zinc-500 text-sm leading-relaxed">
                                PBeyond brings students and industry together in one structured, transparent, and human experience.
                            </p>
                        </div>

                        {/* Scrolling right items — wider, for screenshots */}
                        <div className="flex flex-col gap-32 w-2/3 py-8">
                            {stickyItems.map((item) => (
                                <div key={item.number} className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
                                        <span className="text-xs font-mono text-zinc-400">{item.number} — {item.label}</span>
                                    </div>
                                    <h3 className="text-2xl font-sato font-semibold text-zinc-900 leading-snug">
                                        {item.heading}
                                    </h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        {item.body}
                                    </p>
                                    {/* Screenshot placeholder */}
                                    <FollowCursor label={item.cursorLabel}>
                                        <div className="mt-4 w-full aspect-video rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden">
                                        <img
                                            src={`/images/screenshot-${item.number}.png`}
                                            alt={item.label}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </div>
                                    </FollowCursor>
                                    <div className="mt-2 h-px w-full bg-zinc-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Closing Section */}
                <section className="bg-white rounded-b-[2rem]">
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <h2 className="text-3xl font-bold text-zinc-900">Ready to start?</h2>
                        <p className="mt-4 text-zinc-600">Join the network and elevate your professional journey.</p>
                    </div>
                </section>

            </div>
        </IndexLayout>
    );
}