import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface TextRevealProps {
    value: string;
}

export default function TextReveal({ value }: TextRevealProps) {
    const container = useRef<HTMLParagraphElement>(null);

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start 0.9', 'start 0.25'],
    });

    const words = value.split(' ');

    return (
        <p ref={container} className="flex flex-wrap gap-x-[0.25em]">
            {words.map((word, i) => {
                const start = i / words.length;
                const end = start + 1 / words.length;
                return (
                    <Word key={i} progress={scrollYProgress} range={[start, end]}>
                        {word}
                    </Word>
                );
            })}
        </p>
    );
}

interface WordProps {
    children: string;
    progress: MotionValue<number>;
    range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
    const opacity = useTransform(progress, range, [0, 1]);

    return (
        <span className="relative inline-block">
            {/* Faint background word */}
            <span className="absolute inset-0 text-zinc-400 select-none">
                {children}
            </span>
            {/* Animated foreground word */}
            <motion.span style={{ opacity }} className="relative">
                {children}
            </motion.span>
        </span>
    );
};