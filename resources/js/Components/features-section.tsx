const features = [
    {
        number: '01',
        title: 'Discover',
        description: 'Access a wide range of industry opportunities through a single, intuitive portal.',
    },
    {
        number: '02',
        title: 'Connect',
        description: 'Facilitate direct communication between talent and recruiters without the administrative friction.',
    },
    {
        number: '03',
        title: 'Succeed',
        description: 'Track every milestone with precision, from initial quota requests to successful career starts.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="max-w-5xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <div key={feature.number} className="flex flex-col justify-between border border-border rounded-2xl p-8 min-h-[260px] hover:shadow-sm transition-shadow duration-200">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-primary" />
                            <span className="text-sm font-mono text-muted-foreground">{feature.number}</span>
                        </div>
                        <div className="mt-auto">
                            <h3 className="text-2xl font-sato font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}