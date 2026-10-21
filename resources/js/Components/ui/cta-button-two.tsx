import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function CtaButtonTwo({ href, label }: { href: string; label: string }) {
    return <Button asChild><Link href={href}>{label}<ArrowUpRight aria-hidden="true" /></Link></Button>;
}
