import { useEffect, useSyncExternalStore } from 'react';
import { router } from '@inertiajs/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { buttonVariants } from '@/Components/ui/button';
import { answerConfirmation, cancelConfirmations, currentConfirmation, subscribeToConfirmations } from '@/lib/confirm-action';

export default function ConfirmationHost() {
    const request = useSyncExternalStore(subscribeToConfirmations, currentConfirmation, () => null);

    useEffect(() => {
        const unsubscribe = router.on('before', () => { cancelConfirmations(); });
        return () => { unsubscribe(); cancelConfirmations(); };
    }, []);

    if (!request) return null;

    return <AlertDialog open onOpenChange={(open) => { if (!open) answerConfirmation(request.id, false); }}>
        <AlertDialogContent onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (request.trigger?.isConnected) request.trigger.focus();
        }}>
            <AlertDialogHeader>
                <AlertDialogTitle>{request.title ?? 'Confirm this action?'}</AlertDialogTitle>
                <AlertDialogDescription className="whitespace-pre-line">{request.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => answerConfirmation(request.id, false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction className={buttonVariants({ variant: request.destructive ? 'destructive' : 'default' })} onClick={() => answerConfirmation(request.id, true)}>
                    {request.confirmLabel ?? 'Confirm'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>;
}
