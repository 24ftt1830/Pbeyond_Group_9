import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/Components/ui/alert-dialog';

type Branch = { id: number; name: string; address?: string; district?: string };
type Quota = { quota_id: number; job_title: string; skills?: string[]; remaining_slots: number; interview_required: boolean; branches: Branch[] };
type StudentApplication = { application_id: number; quota_id: number; app_status: string; company_branch_id?: number };
type Props = { company: { company_id: number; company_name: string; description?: string }; quotas: Quota[]; applications?: StudentApplication[] };

export default function ViewCompany({ company, quotas, applications = [] }: Props) {
    const { auth } = usePage<any>().props;
    const student = auth?.user?.student;
    const [branches, setBranches] = useState<Record<number, string>>({});
    const [processing, setProcessing] = useState(false);
    const activeApplication = applications[0];
    const errorToast = (errors: Record<string, string>) => toast.error(String(Object.values(errors)[0] ?? 'Unable to complete this action.'));
    const apply = (quota: Quota) => {
        if (!student?.profile_complete || !student?.cv_generated_at || !student?.cv_snapshot) {
            toast.error('Complete your profile and generate your CV before applying.');
            return;
        }
        const branchId = branches[quota.quota_id] || (quota.branches.length === 1 ? String(quota.branches[0].id) : '');
        if (!branchId) { toast.error('Choose a branch before applying.'); return; }
        router.post(route('student.companies.apply', { company: company.company_id }), { quota_id: quota.quota_id, company_branch_id: Number(branchId) }, {
            preserveScroll: true, onStart: () => setProcessing(true), onFinish: () => setProcessing(false),
            onSuccess: () => toast.success('Application submitted.'), onError: errorToast,
        });
    };
    const cancel = (application: StudentApplication) => router.delete(route('student.applications.cancel', { application: application.application_id }), {
        preserveScroll: true, onStart: () => setProcessing(true), onFinish: () => setProcessing(false), onSuccess: () => toast.success('Application cancelled. Its history has been retained.'), onError: errorToast,
    });
    return <main className="space-y-6 p-6">
        <header className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><Link href={route('student.companies')} aria-label="Back to companies" className="rounded-lg border border-slate-200 bg-white p-2"><ChevronLeft className="size-5" /></Link><div><h1 className="text-3xl font-bold">Company Overview</h1><p className="mt-1 text-sm text-slate-500">Browse positions and choose your preferred branch.</p></div></div><Badge variant="secondary">{activeApplication ? '1 active application' : 'No active application'}</Badge></header>
        <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">{company.company_name}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">{company.description || 'No company description provided.'}</p></section>
        {activeApplication && <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">You can have one active application at a time. <Link className="font-semibold underline" href={route('student.application-tracking')}>Track your application</Link> before applying again.</p>}
        <section className="space-y-4"><h2 className="text-lg font-semibold">Available positions</h2>{quotas.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">No positions are currently available.</p>}{quotas.map((quota) => {
            const application = applications.find((item) => item.quota_id === quota.quota_id);
            const branchId = application?.company_branch_id ? String(application.company_branch_id) : branches[quota.quota_id] || (quota.branches.length === 1 ? String(quota.branches[0].id) : '');
            const selectedBranch = quota.branches.find((branch) => String(branch.id) === branchId);
            return <article key={quota.quota_id} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">{quota.job_title}</h3><p className="mt-1 text-xs text-slate-500">{quota.remaining_slots} slots available · Interview {quota.interview_required ? 'required' : 'not required'}</p></div>{application && <Badge variant="secondary">{application.app_status}</Badge>}</div>
                {Array.isArray(quota.skills) && quota.skills.length > 0 && <div className="flex flex-wrap gap-2">{quota.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div>}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="w-full max-w-lg space-y-2"><label htmlFor={`branch-${quota.quota_id}`} className="text-sm font-medium">Preferred branch</label><select id={`branch-${quota.quota_id}`} value={branchId} disabled={Boolean(application) || processing} onChange={(event) => setBranches({ ...branches, [quota.quota_id]: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">Select branch</option>{quota.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}{branch.district ? ` — ${branch.district}` : ''}</option>)}</select>{selectedBranch && <p className="flex items-start gap-1.5 text-xs text-slate-500"><MapPin className="mt-0.5 size-3 shrink-0" />{selectedBranch.address}</p>}</div>
                    {application ? application.app_status === 'Pending' ? <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={processing}>Cancel application</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancel this application?</AlertDialogTitle><AlertDialogDescription>You can apply again after cancellation. Your application history will be retained.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep application</AlertDialogCancel><AlertDialogAction onClick={() => cancel(application)}>Confirm cancellation</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : <Button variant="outline" disabled>Application {application.app_status.toLowerCase()}</Button> : <AlertDialog><AlertDialogTrigger asChild><Button disabled={Boolean(activeApplication) || processing || !branchId || quota.remaining_slots <= 0}>Apply</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Apply for {quota.job_title}?</AlertDialogTitle><AlertDialogDescription>Your application will be sent to {company.company_name} for {selectedBranch?.name}. You can have one active application at a time.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Go back</AlertDialogCancel><AlertDialogAction onClick={() => apply(quota)}>Confirm application</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
                </div></article>;
        })}</section>
    </main>;
}
ViewCompany.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
