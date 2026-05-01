interface RadarDotProps {
    label?: string;
    className?: string;
}

export default function RadarDot({ label, className = '' }: RadarDotProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Dot stack */}
            <div className="relative w-[8px] h-[8px]">
                {/* dot1 — outer pulsing ring */}
                <span className="absolute inset-0 rounded-full border-[5px] border-white/60 animate-radar-ring" />
                {/* dot2 — mid fading fill */}
                <span className="absolute inset-0 rounded-none bg-white animate-radar-mid" />
                {/* dot3 — inner breathing core */}
                <span className="absolute inset-0 rounded-none bg-white animate-radar-core" />
            </div>

            {/* Label */}
            {label && (
                <span className="text-xs font-mono text-white/70 whitespace-nowrap">
                    {label}
                </span>
            )}
        </div>
    );
}