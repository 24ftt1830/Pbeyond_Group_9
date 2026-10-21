import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function CtaButton({ href, label }: { href: string; label: string }) {
    return <Button asChild className="border-white/20 bg-white text-primary hover:border-white hover:bg-blue-50 hover:text-primary">
        <Link href={href}>{label}<ArrowUpRight aria-hidden="true" /></Link>
    </Button>;
}
