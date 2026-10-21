import { ButtonHTMLAttributes } from 'react';
import { buttonVariants } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={cn(buttonVariants(), className)}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
