import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';

type BackButtonProps = {
    href?: string;
    onClick?: () => void;
    children: string;
    className?: string;
};

export default function BackButton({ href, onClick, children, className = '' }: BackButtonProps) {
    const buttonClassName = `w-fit justify-start ${className}`;

    if (href) {
        return (
            <Button asChild variant="outline" className={buttonClassName}>
                <Link href={href}>
                    <ArrowLeft aria-hidden="true" />
                    {children}
                </Link>
            </Button>
        );
    }

    return (
        <Button type="button" variant="outline" onClick={onClick} className={buttonClassName}>
            <ArrowLeft aria-hidden="true" />
            {children}
        </Button>
    );
}
