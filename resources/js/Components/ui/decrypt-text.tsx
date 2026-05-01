import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

export interface DecryptTextHandle {
    start: () => void;
    stop: () => void;
}

interface DecryptTextProps {
    text: string;
    className?: string;
    duration?: number;
}

const DecryptText = forwardRef<DecryptTextHandle, DecryptTextProps>(
    ({ text, className = '', duration = 900 }, ref) => {
        const [displayed, setDisplayed] = useState(text);
        const intervalRef = useRef<ReturnType<typeof setInterval>>();
        const startRef = useRef<number>();

        useImperativeHandle(ref, () => ({
            start() {
                clearInterval(intervalRef.current);
                startRef.current = performance.now();
                intervalRef.current = setInterval(() => {
                    const elapsed = performance.now() - startRef.current!;
                    const progress = Math.min(elapsed / duration, 1);
                    const revealedCount = Math.floor(progress * text.length);
                    setDisplayed(
                        text.split('').map((char, i) => {
                            if (char === ' ') return ' ';
                            if (i < revealedCount) return char;
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        }).join('')
                    );
                    if (progress >= 1) {
                        clearInterval(intervalRef.current);
                        setDisplayed(text);
                    }
                }, 30);
            },
            stop() {
                clearInterval(intervalRef.current);
                setDisplayed(text);
            },
        }));

        useEffect(() => () => clearInterval(intervalRef.current), []);

        return (
            <span className={`cursor-default font-mono ${className}`}>
                {displayed}
            </span>
        );
    }
);

DecryptText.displayName = 'DecryptText';
export default DecryptText;