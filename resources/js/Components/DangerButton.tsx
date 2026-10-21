import { ButtonHTMLAttributes } from 'react';
import { buttonVariants } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={cn(buttonVariants({ variant: 'destructive' }), className)}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
