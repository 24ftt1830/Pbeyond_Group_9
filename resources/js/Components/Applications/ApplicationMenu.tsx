import { useRef, useState, type ReactElement, type ReactNode } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';

export type ApplicationMenuAction = {
    label: string;
    action: () => void;
    icon?: ReactNode;
    disabled?: boolean;
    destructive?: boolean;
    separatorBefore?: boolean;
};

/** Finish closing the menu before opening another dialog or navigating. */
export default function ApplicationMenu({ trigger, actions }: { trigger: ReactElement; actions: ApplicationMenuAction[] }) {
    const [open, setOpen] = useState(false);
    const pendingAction = useRef<(() => void) | null>(null);

    return <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={() => {
            const action = pendingAction.current;
            pendingAction.current = null;
            if (action) requestAnimationFrame(() => action());
        }}>
            {actions.map(item => <MenuAction key={item.label} item={item} onSelect={() => {
                pendingAction.current = item.action;
                setOpen(false);
            }} />)}
        </DropdownMenuContent>
    </DropdownMenu>;
}

function MenuAction({ item, onSelect }: { item: ApplicationMenuAction; onSelect: () => void }) {
    return <>
        {item.separatorBefore && <DropdownMenuSeparator />}
        <DropdownMenuItem disabled={item.disabled} variant={item.destructive ? 'destructive' : 'default'} onSelect={onSelect}>
            {item.icon}{item.label}
        </DropdownMenuItem>
    </>;
}
