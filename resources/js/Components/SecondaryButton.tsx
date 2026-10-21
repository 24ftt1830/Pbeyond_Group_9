import { ButtonHTMLAttributes } from 'react';
import { buttonVariants } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={cn(buttonVariants({ variant: 'outline' }), className)}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
