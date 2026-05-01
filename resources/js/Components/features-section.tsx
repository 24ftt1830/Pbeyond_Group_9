import Magnetic from '@/Components/ui/magnetic';
import DitherImage from '@/Components/ui/dither-image';

const features = [
    {
        number: '01',
        title: 'Discover',
        icon: '/images/icons/binoculars.png',
        description: 'Access a wide range of industry opportunities through a single, intuitive portal.',
    },
    {
        number: '02',
        title: 'Connect',
        icon: '/images/icons/message-square-quote.png',
        description: 'Facilitate direct communication between talent and recruiters without the administrative friction.',
    },
    {
        number: '03',
        title: 'Succeed',
        icon: '/images/icons/trophy.png',
        description: 'Track every milestone with precision, from initial quota requests to successful career starts.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="max-w-5xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <div
                        key={feature.number}
                        className="flex flex-col border border-border rounded-2xl overflow-hidden hover:shadow-sm transition-shadow duration-200"
                    >
                        {/* Dithered icon area */}
                        <Magnetic strength={0.35} className="w-full h-48 border-b border-border overflow-hidden">
                            <DitherImage
                                src={feature.icon}
                                className="w-full h-full"
                            />
                        </Magnetic>

                        {/* Text content */}
                        <div className="flex flex-col gap-2 p-8">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2.5 h-2.5 bg-primary" />
                                <span className="text-sm font-mono text-muted-foreground">{feature.number}</span>
                            </div>
                            <h3 className="text-2xl font-sato font-semibold">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}