import { useState, type FormEvent, type ReactNode } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, FileText, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge, type BadgeProps } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import ApplicationMenu, { type ApplicationMenuAction } from '@/Components/Applications/ApplicationMenu';
import DecisionNotice from '@/Components/Applications/DecisionNotice';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { confirmAction } from '@/lib/confirm-action';
import { canCompanyReviewApplication, hasFinalApplicationDecision, finalDecisionNotice } from '@/lib/application-review';

type History = { id: number; from_status: string | null; to_status: string; created_at: string | null };
type Application = {
    id: number;
    quota_id: number;
    app_status: string;
    interview_date: string | null;
    created_at: string | null;
    has_cv: boolean;
    student: { full_name: string; pb_student_code: string; email: string | null; mobile_phone: string | null; cgpa: string | number | null; programme_name: string | null };
    branch: { name: string; address: string | null; district: string | null } | null;
    history: History[];
};
type Props = {
    application: Application;
    quota: { quota_id: number; slug: string; job_title: string; interview_required: boolean };
    candidates: { position: number; total: number; previous_id: number | null; next_id: number | null };
};

function formatDate(value: string | null) {
    if (!value) return 'Not recorded';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function badgeVariant(status: string): BadgeProps['variant'] {
    switch (status) {
        case 'Recruited': case 'Approved': return 'success';
        case 'Declined': return 'destructive';
        case 'Interviewing': return 'info';
        case 'Cancelled': return 'secondary';
        default: return 'warning';
    }
}

function reviewState(application: Application) {
    switch (application.app_status) {
        case 'Recruited': case 'Approved': case 'Declined': return 'Completed';
        case 'Cancelled': return 'Cancelled';
        case 'Interviewing': return application.interview_date ? 'Interview scheduled' : 'Awaiting interview date';
        case 'Waitlisted': return 'On hold';
        default: return 'Pending review';
    }
}

function activityLabel(status: string, from: string | null) {
    if (!from && status === 'Pending') return 'Application submitted';
    switch (status) {
        case 'Interviewing': return 'Moved to interview stage';
        case 'Waitlisted': return 'Application waitlisted';
        case 'Recruited': case 'Approved': return 'Application accepted';
        case 'Declined': return 'Application declined';
        case 'Cancelled': return 'Application cancelled';
        case 'Pending': return 'Returned to review';
        default: return `Status changed to ${status.replaceAll('_', ' ')}`;
    }
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
    return <div className="min-w-0 space-y-1">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-medium text-foreground">{children || 'Not provided'}</dd>
    </div>;
}

export default function Details({ application, quota, candidates }: Props) {
    const [processing, setProcessing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [interviewOpen, setInterviewOpen] = useState(false);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewError, setInterviewError] = useState('');
    const busy = processing || confirming;
    const decisionFinal = hasFinalApplicationDecision(application.app_status);
    const canUpdate = canCompanyReviewApplication(application.app_status);
    const initials = application.student.full_name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const cgpa = application.student.cgpa == null || application.student.cgpa === '' ? 'Not provided' : Number(application.student.cgpa).toFixed(2);
    const events = application.history.map(item => ({
        key: String(item.id), title: activityLabel(item.to_status, item.from_status), date: item.created_at,
        detail: item.from_status ? `${item.from_status.replaceAll('_', ' ')} → ${item.to_status.replaceAll('_', ' ')}` : null,
    }));
    if (!application.history.some(item => !item.from_status && item.to_status === 'Pending')) {
        events.unshift({ key: 'submitted', title: 'Application submitted', date: application.created_at, detail: null });
    }

    const openInterview = () => {
        if (!canUpdate || busy) return;
        const date = application.interview_date ? new Date(application.interview_date) : null;
        setInterviewDate(date && !Number.isNaN(date.getTime())
            ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
        setInterviewError('');
        setInterviewOpen(true);
    };

    const updateStatus = async (status: string, date?: string) => {
        if (busy || !canUpdate) return;
        if (status !== 'Interviewing') {
            setConfirming(true);
            const accepted = await confirmAction(
                (status === 'Recruited' ? 'Accept this application and recruit this student? The student will be notified.'
                    : 'Decline this application? The student will be notified.') + '\n\n' + finalDecisionNotice,
                {
                    title: status === 'Recruited' ? 'Accept application?' : 'Decline application?',
                    confirmLabel: status === 'Recruited' ? 'Accept application' : 'Decline application',
                    destructive: status === 'Declined',
                }
            );
            setConfirming(false);
            if (!accepted) return;
        }
        router.put(route('company.applications.update-status', { quota: quota.quota_id, application: application.id }), {
            status, ...(date ? { interview_date: date } : {}),
        }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setInterviewOpen(false);
                toast.success(status === 'Interviewing' ? 'Interview scheduled.' : 'Application status updated.');
            },
            onError: errors => {
                const message = String(Object.values(errors)[0] ?? 'Unable to update this application.');
                setInterviewError(errors.interview_date ? String(errors.interview_date) : '');
                toast.error(message);
            },
        });
    };

    const scheduleInterview = (event: FormEvent) => {
        event.preventDefault();
        if (!interviewDate) { setInterviewError('Choose an interview date and time.'); return; }
        void updateStatus('Interviewing', interviewDate);
    };

    return <>
        <Head title={`${application.student.full_name} · Application details`} />
        <main className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <BackButton href={route('company.applications.show', quota.slug)}>Back to applicants</BackButton>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Candidate {candidates.position} of {candidates.total}</span>
                    {candidates.previous_id ? <Button variant="outline" size="icon" asChild><Link href={route('company.applications.details', candidates.previous_id)} aria-label="Previous candidate"><ChevronLeft /></Link></Button> : <Button variant="outline" size="icon" disabled aria-label="Previous candidate"><ChevronLeft /></Button>}
                    {candidates.next_id ? <Button variant="outline" size="icon" asChild><Link href={route('company.applications.details', candidates.next_id)} aria-label="Next candidate"><ChevronRight /></Link></Button> : <Button variant="outline" size="icon" disabled aria-label="Next candidate"><ChevronRight /></Button>}
                </div>
            </div>
            <header><h1>Application details</h1><p>{quota.job_title}</p></header>
            <Card>
                <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex min-w-0 items-center gap-4">
                        <Avatar className="size-14 shrink-0"><AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials}</AvatarFallback></Avatar>
                        <div className="min-w-0"><h2 className="break-words text-lg font-semibold">{application.student.full_name}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{application.student.email || 'Email not provided'}</p></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={badgeVariant(application.app_status)}>{application.app_status.replaceAll('_', ' ')}</Badge>
                        {application.has_cv ? <Button variant="outline" asChild><Link href={route('company.applications.view', application.id)}><FileText />View CV</Link></Button> : <Button variant="outline" disabled><FileText />CV unavailable</Button>}
                        {canUpdate && <ApplicationMenu
                            trigger={<Button variant="outline" size="icon" disabled={busy} aria-label="Application actions"><MoreHorizontal /></Button>}
                            actions={[
                                ...(quota.interview_required ? [{ label: application.interview_date ? 'Reschedule interview' : 'Schedule interview', icon: <CalendarDays className="size-4" />, action: openInterview }] : []),
                                { label: 'Accept application', disabled: application.app_status === 'Recruited', action: () => void updateStatus('Recruited'), separatorBefore: quota.interview_required },
                                { label: 'Decline application', disabled: application.app_status === 'Declined', destructive: true, action: () => void updateStatus('Declined') },
                            ] satisfies ApplicationMenuAction[]}
                        />}
                    </div>
                </CardHeader>
                <CardContent><dl className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailField label="Stage">{quota.interview_required ? 'Interview stage' : 'Direct review stage'}</DetailField>
                    <DetailField label="State">{reviewState(application)}</DetailField>
                    <DetailField label="Applied on">{formatDate(application.created_at)}</DetailField>
                    <DetailField label="Selected branch">{application.branch ? [application.branch.name, application.branch.district].filter(Boolean).join(' · ') : null}</DetailField>
                </dl></CardContent>
            </Card>
            {application.app_status !== 'Cancelled' && <DecisionNotice locked={decisionFinal} />}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-6">
                    <Card><CardHeader><CardTitle>Academic details</CardTitle></CardHeader><CardContent><dl className="grid gap-5 sm:grid-cols-2">
                        <DetailField label="Student ID">{application.student.pb_student_code}</DetailField>
                        <DetailField label="Email">{application.student.email}</DetailField>
                        <DetailField label="Phone">{application.student.mobile_phone}</DetailField>
                        <DetailField label="CGPA">{cgpa}</DetailField>
                        <div className="sm:col-span-2"><DetailField label="Programme">{application.student.programme_name}</DetailField></div>
                    </dl></CardContent></Card>
                    {quota.interview_required && <Card><CardHeader className="flex-row items-start justify-between gap-3 space-y-0"><div><CardTitle>Interview details</CardTitle><CardDescription className="mt-1">{application.interview_date ? formatDate(application.interview_date) : 'No interview scheduled yet.'}</CardDescription></div>{canUpdate && <Button variant="outline" size="sm" disabled={busy} onClick={openInterview}>{application.interview_date ? 'Reschedule' : 'Set date'}</Button>}</CardHeader></Card>}
                    {application.app_status === 'Cancelled' && <p className="text-sm text-muted-foreground">The student cancelled this application. Its history is retained and Company HR cannot change its status.</p>}
                </div>
                <Card><CardHeader><CardTitle>Activity</CardTitle><CardDescription>Recorded changes to this application.</CardDescription></CardHeader><CardContent>
                    <ol className="space-y-5 border-l border-border pl-5">{events.map(event => <li key={event.key} className="relative"><span aria-hidden="true" className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-primary" /><p className="text-sm font-medium">{event.title}</p>{event.detail && <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>}<p className="mt-1 text-xs text-muted-foreground">{formatDate(event.date)}</p></li>)}</ol>
                </CardContent></Card>
            </div>
        </main>
        <Dialog open={interviewOpen} onOpenChange={open => { if (!processing) setInterviewOpen(open); }}><DialogContent>
            <DialogHeader><DialogTitle>{application.interview_date ? 'Reschedule interview' : 'Schedule interview'}</DialogTitle><DialogDescription>Set the interview date and time for {application.student.full_name}.</DialogDescription></DialogHeader>
            <form onSubmit={scheduleInterview} className="space-y-5">
                <div className="space-y-2"><Label htmlFor="candidate-interview-date">Interview date and time</Label><Input id="candidate-interview-date" type="datetime-local" required disabled={processing} value={interviewDate} onChange={event => setInterviewDate(event.target.value)} aria-invalid={Boolean(interviewError)} />{interviewError && <p className="text-sm text-destructive">{interviewError}</p>}</div>
                <DialogFooter><Button type="button" variant="outline" disabled={processing} onClick={() => setInterviewOpen(false)}>Cancel</Button><Button type="submit" disabled={busy}>{processing ? 'Saving…' : 'Save interview'}</Button></DialogFooter>
            </form>
        </DialogContent></Dialog>
    </>;
}

Details.layout = (page: ReactNode) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;
