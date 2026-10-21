import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Errors } from '@/Components/Admin/RecordControls';

export type InvitationStudent = {
    user_id: number;
    username: string;
    email: string;
    student_invitation_status: 'not_invited' | 'queued' | 'sent' | 'failed' | 'active';
    student_invitation_error?: string | null;
    student?: { full_name?: string };
};

export function StudentAccessBadge({ status }: { status: InvitationStudent['student_invitation_status'] }) {
    const labels = { not_invited: 'Not invited', queued: 'Sending', sent: 'Awaiting setup', failed: 'Sending failed', active: 'Active' };
    const variants = { not_invited: 'secondary', queued: 'info', sent: 'warning', failed: 'destructive', active: 'success' } as const;
    return <Badge variant={variants[status] ?? 'secondary'} className="whitespace-nowrap">{labels[status] ?? 'Not invited'}</Badge>;
}

export function StudentInvitationButton({ recipients, resend = false, disabled = false, bulk = false }: {
    recipients: InvitationStudent[];
    resend?: boolean;
    disabled?: boolean;
    bulk?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [previewRecipients, setPreviewRecipients] = useState<InvitationStudent[]>([]);
    const form = useForm<{ user_ids: number[]; invitation?: string }>({ user_ids: [] });
    const retry = recipients[0]?.student_invitation_status === 'failed';
    const label = resend ? (retry ? 'Retry invitation' : 'Resend invitation') : bulk ? `Send account invitations (${recipients.length})` : 'Send invitation';
    const send = () => {
        form.transform(() => ({ user_ids: previewRecipients.map((student) => student.user_id) }));
        form.post(resend ? route('admin.students.invitations.resend', previewRecipients[0].user_id) : route('admin.students.invitations.store'), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };
    return <>
        <Button type="button" size="sm" variant={bulk ? 'default' : 'outline'} className="gap-1.5" disabled={disabled || !recipients.length || form.processing} onClick={() => { form.clearErrors(); setPreviewRecipients([...recipients]); setOpen(true); }}>
            {resend ? <RefreshCw className="size-3.5" /> : <Mail className="size-3.5" />}{label}
        </Button>
        <Dialog open={open} onOpenChange={(value) => { if (!form.processing) setOpen(value); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>{resend ? 'Resend student invitation?' : 'Release student access?'}</DialogTitle><DialogDescription>Send a password setup link to {previewRecipients.length} {previewRecipients.length === 1 ? 'student' : 'students'}. Each link expires after 24 hours. Students choose their own passwords.</DialogDescription></DialogHeader>
                <div className="max-h-64 divide-y overflow-y-auto rounded-lg border px-3">{previewRecipients.map((student) => <div key={student.user_id} className="py-3 text-sm"><p className="font-medium">{student.student?.full_name ?? student.username}</p><p className="break-all text-slate-500">{student.email}</p></div>)}</div>
                <p className="text-sm text-slate-500">{resend ? 'Sending a new setup link replaces the previous invitation link.' : 'Existing invited and active accounts are skipped. You can resend an invitation separately.'}</p>
                <Errors errors={form.errors} />
                <DialogFooter><Button type="button" variant="outline" disabled={form.processing} onClick={() => setOpen(false)}>Cancel</Button><Button type="button" disabled={form.processing} onClick={send}>{form.processing ? 'Queuing…' : 'Confirm and send'}</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    </>;
}

export function StudentAccountAction({ student, disabled = false }: { student: InvitationStudent; disabled?: boolean }) {
    if (student.student_invitation_status === 'active' || student.student_invitation_status === 'queued') return null;
    return <StudentInvitationButton recipients={[student]} disabled={disabled} resend={['sent', 'failed'].includes(student.student_invitation_status)} />;
}
