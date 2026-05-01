import { useRef } from 'react';
import { Link } from '@inertiajs/react';

interface CtaButtonProps {
    href: string;
    label: string;
}

export default function CtaButtonTwo({ href, label }: CtaButtonProps) {
    const squareRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number>();
    const buttonRef = useRef<HTMLAnchorElement>(null);

    const pos = useRef(0);
    const target = useRef(0);
    const rotation = useRef(0);
    const rotationSpeed = useRef(0);
    const isHovered = useRef(false);
    const travelDistance = useRef(0);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
        pos.current = lerp(pos.current, target.current, 0.08);

        const progress = travelDistance.current > 0
            ? Math.min(pos.current / travelDistance.current, 1)
            : 0;

        if (isHovered.current) {
            const distanceLeft = 1 - progress;
            rotationSpeed.current = lerp(rotationSpeed.current, distanceLeft < 0.05 ? 0 : 8, 0.1);
        } else {
            rotationSpeed.current = lerp(rotationSpeed.current, 0, 0.08);
        }

        rotation.current += rotationSpeed.current;

        if (Math.abs(rotationSpeed.current) < 0.1) {
            const nearest90 = Math.round(rotation.current / 90) * 90;
            rotation.current = lerp(rotation.current, nearest90, 0.15);
        }

        if (squareRef.current) {
            squareRef.current.style.transform = `translateX(${pos.current}px) rotate(${rotation.current}deg)`;
        }

        if (labelRef.current) {
            labelRef.current.style.transform = `translateX(${-pos.current * 0.3}px)`;
            // FLIPPED: Lerping from 0% (black) to 100% (white)
            const lightness = Math.round(lerp(0, 100, progress));
            labelRef.current.style.color = `hsl(0, 0%, ${lightness}%)`;
        }

        if (fillRef.current) {
            fillRef.current.style.transform = `translateX(${-100 + progress * 100}%)`;
        }

        const posSettled = Math.abs(pos.current - target.current) < 0.05;
        const rotSettled = Math.abs(rotationSpeed.current) < 0.05;

        if (!posSettled || !rotSettled || isHovered.current) {
            animRef.current = requestAnimationFrame(animate);
        }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        travelDistance.current = rect.width - 20 - 40;
        target.current = travelDistance.current;
        isHovered.current = true;
        cancelAnimationFrame(animRef.current!);
        animRef.current = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
        target.current = 0;
        isHovered.current = false;
        cancelAnimationFrame(animRef.current!);
        animRef.current = requestAnimationFrame(animate);
    };

    return (
        <Link
            ref={buttonRef}
            href={href}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative inline-flex items-center gap-4 overflow-hidden border border-black/20 bg-white px-5 py-3 cursor-pointer"
        >
            <div
                ref={fillRef}
                className="absolute inset-0 bg-primary pointer-events-none"
                style={{ transform: 'translateX(-100%)' }}
            />

            <div
                ref={squareRef}
                className="relative z-10 w-5 h-5 bg-black shrink-0"
                style={{ transform: 'translateX(0px) rotate(0deg)' }}
            />

            <span
                ref={labelRef}
                className="relative z-10 text-sm font-sato font-semibold tracking-wide"
                style={{ transform: 'translateX(0px)', color: 'hsl(0, 0%, 0%)' }}
            >
                {label}
            </span>
        </Link>
    );
}