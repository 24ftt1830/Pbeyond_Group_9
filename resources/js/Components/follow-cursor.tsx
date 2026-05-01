import { useRef, useState, useEffect } from 'react';

interface FollowCursorProps {
    label: string;
    children: React.ReactNode;
}

export default function FollowCursor({ label, children }: FollowCursorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [active, setActive] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const tiltTimeout = useRef<ReturnType<typeof setTimeout>>();

    const applyTilt = (dx: number) => {
        if (!pillRef.current) return;
        const tilt = Math.max(-12, Math.min(12, dx * 0.4));
        pillRef.current.style.transform = `rotate(${tilt}deg) scale(1.05)`;
        clearTimeout(tiltTimeout.current);
        tiltTimeout.current = setTimeout(() => {
            if (pillRef.current) pillRef.current.style.transform = 'rotate(0deg) scale(1)';
        }, 120);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - lastPos.current.x;
        lastPos.current = { x, y };
        setPos({ x, y });
        applyTilt(dx);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        lastPos.current = { x, y };
        setPos({ x, y });
        setActive(true);
    };

    useEffect(() => () => clearTimeout(tiltTimeout.current), []);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setActive(false)}
            className="relative"
        >
            {children}

            <div
                className={`pointer-events-none absolute z-50 transition-opacity duration-200 ${
                    active ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -120%)',
                }}
            >
                <div
                    ref={pillRef}
                    className="bg-primary text-white text-xs font-sato font-semibold px-4 py-2 rounded-full whitespace-nowrap shadow-lg select-none"
                    style={{ transition: 'transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                    {label}
                </div>
            </div>
        </div>
    );
}