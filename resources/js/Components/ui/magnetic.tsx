import { useRef, ReactNode } from 'react';

interface MagneticProps {
    children: ReactNode;
    strength?: number;
    className?: string;
}

export default function Magnetic({ children, strength = 0.3, className = '' }: MagneticProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number>();
    const pos = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
        pos.current.x = lerp(pos.current.x, target.current.x, 0.12);
        pos.current.y = lerp(pos.current.y, target.current.y, 0.12);

        if (innerRef.current) {
            innerRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        }

        const dx = Math.abs(target.current.x - pos.current.x);
        const dy = Math.abs(target.current.y - pos.current.y);
        if (dx > 0.01 || dy > 0.01) {
            animRef.current = requestAnimationFrame(animate);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Use the wrapper (zone) rect to calculate center
        const rect = wrapperRef.current!.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        target.current = {
            x: (e.clientX - cx) * strength,
            y: (e.clientY - cy) * strength,
        };
        cancelAnimationFrame(animRef.current!);
        animRef.current = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
        target.current = { x: 0, y: 0 };
        cancelAnimationFrame(animRef.current!);
        animRef.current = requestAnimationFrame(animate);
    };

    return (
        <div
            ref={wrapperRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
        >
            <div ref={innerRef} className="w-full h-full">
                {children}
            </div>
        </div>
    );
}