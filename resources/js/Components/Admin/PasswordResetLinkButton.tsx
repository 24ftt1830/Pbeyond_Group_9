import { useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { confirmAction } from '@/lib/confirm-action';

export default function PasswordResetLinkButton({ userId, name, email, emailChanged = false }: {
    userId: number | string;
    name: string;
    email: string;
    emailChanged?: boolean;
}) {
    const form = useForm<{ reset_link?: string }>({});
    const [confirming, setConfirming] = useState(false);

    const sendLink = async () => {
        if (form.processing || confirming || emailChanged) return;
        setConfirming(true);
        const confirmed = await confirmAction(`Send a password reset link to ${name} at ${email}?\n\nThey will choose their own password. Their current password stays valid until they complete the reset.`, {
            title: 'Send password reset link?', confirmLabel: 'Send reset link', destructive: false,
        });
        setConfirming(false);
        if (!confirmed) return;

        form.clearErrors();
        form.post(route('admin.manage-users.password-reset', userId), {
            preserveScroll: true,
            onSuccess: () => toast.success(`Password reset link sent to ${email}.`),
            onError: (errors) => toast.error(errors.reset_link ?? 'The reset link could not be sent. Please try again.'),
        });
    };

    return <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div><p className="text-sm font-semibold text-slate-900">Password recovery</p><p className="mt-1 text-sm text-slate-500">Email a reset link so this person can choose a new password.</p></div>
        {emailChanged && <p className="text-sm text-amber-700">Save the changed email address before sending a reset link.</p>}
        {form.errors.reset_link && <p role="alert" className="text-sm text-red-600">{form.errors.reset_link}</p>}
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={form.processing || confirming || emailChanged} onClick={sendLink}>
            <Mail className="size-4" />{form.processing ? 'Sending…' : 'Send password reset link'}
        </Button>
    </div>;
}
