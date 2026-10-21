import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { BriefcaseBusiness, CalendarDays, CalendarPlus, GraduationCap, Pencil, Plus, Search, Users, X } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import QuotaCard from '@/Components/QuotaCard';
import QuotaNumberInput from '@/Components/QuotaNumberInput';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { DataTable } from '@/Components/ui/data-table';
import { ConfirmAction, Errors, Field, RecordFeedback } from '@/Components/Admin/RecordControls';
import { EditDialog, RecordTabs, formatDate } from '@/Components/Admin/RecordView';
import { SupervisorForm, type Supervisor } from '@/Components/Admin/SupervisorAccounts';
import CompanyBranchEditor, { districts, type CompanyBranch } from '@/Components/CompanyBranchEditor';

type Programme = { programme_id: number; programme_name: string };
type AcademicSemester = { id: number; name: string };
type Student = { student_id: number; full_name: string; pb_student_code: string; programme?: { programme_name: string }; internship?: { start_date: string; end_date: string } | null };
type Application = { id: number; app_status: string; interview_date?: string | null; student?: Student };
type Quota = { quota_id: number; company_id: number; academic_semester_id: number | null; academic_semester?: AcademicSemester | null; job_title: string; total_slots: number; skills?: string[]; interview_required: boolean; quota_status: string; is_released: boolean; programmes?: Programme[]; applications?: Application[]; branches?: (CompanyBranch & { id: number })[] };
type CompanySupervisor = { supervisor_id: number; user_id: number | null; full_name: string; email: string; phone?: string | null; position?: string | null; quota_id?: number | null; user?: { username: string; email: string } | null; quota?: { job_title: string } | null };
type Company = { company_id: number; company_name: string; office_address?: string | null; industry_sector?: string | null; description?: string | null; additional_information?: string | null; users: { user_id: number; username: string; email: string; role: string }[]; industry_supervisors: CompanySupervisor[]; placement_quotas: Quota[]; district?: string; branches: CompanyBranch[] };
type Applicant = Application & { position: string };
const tabs = ['Company Profile', 'Placement Quotas', 'Manage Users', 'Applications', 'Interns'];
const date = (value?: string | null) => value?.split('T')[0] ?? '';

export default function CompanyRecord({ company, programmes, academicSemesters, today }: { company: Company; programmes: Programme[]; academicSemesters: AcademicSemester[]; today: string }) {
    const [tab, setTab] = useState(tabs[0]);
    const [search, setSearch] = useState('');
    const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
    const [selectedQuota, setSelectedQuota] = useState<Quota | undefined>();
    const applicants: Applicant[] = company.placement_quotas.flatMap((quota) => (quota.applications ?? []).map((application) => ({ ...application, position: quota.job_title })));
    const recruited = applicants.filter((application) => application.app_status === 'Recruited' && application.student);
    const interns = recruited.filter((application, index) => recruited.findIndex((candidate) => candidate.student!.student_id === application.student!.student_id) === index);
    const editQuota = (quota: Quota) => { setSelectedQuota(quota); setQuotaDialogOpen(true); };
    const scopeCompanies = [{ company_id: company.company_id, company_name: company.company_name }];
    const hasHrAccount = company.users.some((user) => user.role === 'Company');
    const manageHrAccountUrl = route('admin.manage-users', {
        tab: 'reps',
        company_id: company.company_id,
        ...(!hasHrAccount ? { action: 'create' } : {}),
    });
    const internshipStatus = (student: Student) => !student.internship ? 'Dates not set' : date(student.internship.start_date) > today ? 'Upcoming' : date(student.internship.end_date) < today ? 'Ended' : 'In Progress';

    return <AuthenticatedLayout><Head title={`${company.company_name} - Company Details`} /><RecordFeedback />
        <main className="space-y-6 p-6">
            <BackButton href={route('admin.companies')}>Back to Companies</BackButton>
            <Card className="border-none bg-transparent shadow-none"><CardHeader className="flex flex-row flex-wrap items-center gap-4 px-0 py-0"><Avatar className="h-20 w-20 border-2 border-background shadow-sm"><AvatarFallback className="bg-primary text-xl text-primary-foreground">{company.company_name.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><CardTitle className="text-2xl">{company.company_name}</CardTitle><CardDescription className="mt-2 text-base">{company.industry_sector || 'Industry sector not provided'}</CardDescription></div></CardHeader></Card>
            <RecordTabs tabs={tabs} value={tab} onChange={(value) => { setTab(value); setSearch(''); }} label="Company details" />

            {tab === tabs[0] && <Card className="border shadow-none"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>Company Profile</CardTitle><CardDescription className="mt-2">Company information and office details.</CardDescription></div><EditDialog label="Edit company profile" title="Edit Company Profile" description="Update the company's registered profile information.">{(close) => <CompanyProfileForm company={company} close={close} />}</EditDialog></div></CardHeader><CardContent className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2"><Field label="Company Name"><Input readOnly value={company.company_name} /></Field><Field label="Industry Sector"><Input readOnly value={company.industry_sector ?? ''} placeholder="Not provided" /></Field></div>
                <Field label="Office Address"><Input readOnly value={company.office_address ?? ''} placeholder="Not provided" /></Field>
                <Field label="District"><Input readOnly value={company.district ?? ''} placeholder="Not assigned" /></Field>
                <div className="space-y-3"><h3 className="text-sm font-semibold">Branches</h3>{company.branches.map((branch) => <div key={branch.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-medium">{branch.name} · {branch.district || 'District not assigned'}</p><p className="mt-1 text-xs text-slate-500">{branch.address}</p></div>)}</div>
                <Field label="Description"><textarea readOnly value={company.description ?? ''} placeholder="Not provided" className="ui-textarea min-h-[100px] w-full px-3 py-2" /></Field>
                <Field label="Additional Information"><textarea readOnly value={company.additional_information ?? ''} placeholder="Not provided" className="ui-textarea min-h-[100px] w-full px-3 py-2" /></Field>
            </CardContent></Card>}

            {tab === tabs[1] && <div className="space-y-6">
                <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-sans text-3xl font-semibold">Placement Quotas</h1><p className="mt-1 text-muted-foreground">Create and manage student placement opportunities.</p></div><Button size="sm" className="gap-1.5" onClick={() => { setSelectedQuota(undefined); setQuotaDialogOpen(true); }}><Plus className="size-3.5" />New Request</Button></header>
                <SearchField value={search} onChange={setSearch} placeholder="Search job positions…" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{company.placement_quotas.filter((quota) => quota.job_title.toLowerCase().includes(search.toLowerCase())).map((quota) => <div key={quota.quota_id} className="flex flex-col [&>div:first-child]:h-auto [&>div:first-child]:flex-1 [&>div:first-child]:rounded-b-none"><QuotaCard quota={quota} isEditMode={false} onEdit={() => editQuota(quota)} /><div className="-mt-px space-y-3 rounded-b-xl border bg-muted/30 p-4"><p className="text-sm text-muted-foreground">{(quota.applications ?? []).filter((application) => application.app_status === 'Recruited').length} / {quota.total_slots} students · {quota.is_released ? 'Available to students' : 'Hidden from new applications'}</p><div className="flex flex-wrap gap-2 [&_button]:rounded-md [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs">{quota.quota_status === 'Approved' && <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => editQuota(quota)}><Pencil className="size-3.5" />Edit quota</Button>}<ConfirmAction label="Approve and release" url={route('admin.placements.approve', quota.quota_id)} description="Approve this job quota and make it available to students." disabled={quota.quota_status === 'Approved' && quota.is_released} /><ConfirmAction label="Reject quota" url={route('admin.placements.reject', quota.quota_id)} description="Reject this quota and hide it from new applications." /><ConfirmAction label="Close applications" url={route('admin.quotas.close', quota.quota_id)} description="Hide this position from new applications. Retain existing applicants and interns." disabled={!quota.is_released} /><ConfirmAction label="Delete quota" url={route('admin.quotas.destroy', quota.quota_id)} method="delete" description="Delete this unused quota. Approved quotas and quotas with applications cannot be deleted." disabled={quota.quota_status === 'Approved' || Boolean(quota.applications?.length)} /></div></div></div>)}</div>
                {!company.placement_quotas.filter((quota) => quota.job_title.toLowerCase().includes(search.toLowerCase())).length && <EmptyCompanyState text="No placement quotas found." />}
            </div>}

            {tab === tabs[2] && <div className="space-y-6">
                <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-sans text-3xl font-semibold">Manage Users</h1><p className="mt-1 text-sm text-muted-foreground">Manage Industry Supervisors and the HR account for this company.</p></div><EditDialog label="Add supervisor" title="Add Industry Supervisor" description="Create a supervisor account for this company." create>{(close) => <SupervisorForm companies={scopeCompanies} quotas={company.placement_quotas} close={close} />}</EditDialog></header>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{company.industry_supervisors.map((supervisor) => {
                    const editable: Supervisor = { id: supervisor.supervisor_id, type: 'industry', user_id: supervisor.user_id, full_name: supervisor.full_name, username: supervisor.user?.username ?? '', email: supervisor.user?.email ?? supervisor.email, phone: supervisor.phone ?? '', position: supervisor.position ?? '', company_id: company.company_id, quota_id: supervisor.quota_id ?? '' };
                    return <Card key={supervisor.supervisor_id} className="shadow-none"><CardHeader><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><Users className="size-5 shrink-0 text-slate-600" /><CardTitle>{supervisor.full_name}</CardTitle></div><EditDialog title="Edit Industry Supervisor" description="Update this company's supervisor account and job assignment.">{(close) => <SupervisorForm supervisor={editable} companies={scopeCompanies} quotas={company.placement_quotas} close={close} />}</EditDialog></div></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p><span className="font-medium text-foreground">Username:</span> {supervisor.user?.username ?? 'No login linked'}</p><p className="break-words"><span className="font-medium text-foreground">Email:</span> {supervisor.email}</p><p><span className="font-medium text-foreground">Position:</span> {supervisor.quota?.job_title ?? supervisor.position ?? 'Not assigned'}</p><p><span className="font-medium text-foreground">Phone:</span> {supervisor.phone ?? 'Not provided'}</p></CardContent></Card>;
                })}</div>
                {!company.industry_supervisors.length && <EmptyCompanyState text="No Industry Supervisors found." />}
                <Card className="shadow-none"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>Company HR Account</CardTitle><CardDescription className="mt-1">{hasHrAccount ? 'View and manage this company’s HR login.' : 'This company does not have an HR login yet.'}</CardDescription></div><Button asChild variant={hasHrAccount ? 'outline' : 'default'} size="sm"><Link href={manageHrAccountUrl}>{hasHrAccount ? 'Manage accounts' : 'Create HR account'}</Link></Button></div></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{company.users.filter((user) => user.role === 'Company').map((user) => <div key={user.user_id} className="rounded-lg border p-4"><p className="font-semibold">{user.username}</p><p className="mt-1 break-words text-sm text-muted-foreground">{user.email}</p></div>)}{!hasHrAccount && <p className="text-sm text-muted-foreground">Create a login for this company from Manage Users.</p>}</CardContent></Card>
            </div>}

            {tab === tabs[3] && <div className="space-y-6"><header><h1 className="font-sans text-3xl font-semibold">Applications</h1><p className="mt-1 text-muted-foreground">Applications for job positions at {company.company_name}.</p></header><DataTable columns={[
                { id: 'student', header: 'Student', cell: ({ row }) => <div><p className="font-medium">{row.original.student?.full_name ?? 'Student'}</p><p className="text-xs text-muted-foreground">{row.original.student?.pb_student_code}</p></div> },
                { accessorKey: 'position', header: 'Job position' },
                { accessorKey: 'app_status', header: 'Status', cell: ({ row }) => <Badge variant="secondary">{row.original.app_status}</Badge> },
                { id: 'manage', header: 'Actions', cell: ({ row }) => row.original.student && <Button asChild variant="outline" size="sm"><Link href={route('admin.students.show', row.original.student.student_id)}>View / manage student</Link></Button> },
            ]} data={applicants} /></div>}

            {tab === tabs[4] && <div className="space-y-6"><header><h1 className="text-3xl font-semibold text-slate-900">Interns</h1><p className="mt-2 text-sm text-slate-600">Set internship dates for recruited students at {company.company_name}.</p></header><div className="grid gap-4 sm:grid-cols-3">
    <Card className="border-slate-200 shadow-sm"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Users className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Total interns</p><p className="text-2xl font-bold text-slate-900">{interns.length}</p></div></CardContent></Card>
    <Card className="border-slate-200 shadow-sm"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><BriefcaseBusiness className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Currently interning</p><p className="text-2xl font-bold text-slate-900">{interns.filter((application) => internshipStatus(application.student!) === 'In Progress').length}</p></div></CardContent></Card>
    <Card className="border-slate-200 shadow-sm"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-amber-50 p-3 text-amber-800"><CalendarPlus className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Dates not set</p><p className="text-2xl font-bold text-slate-900">{interns.filter((application) => !application.student?.internship).length}</p></div></CardContent></Card>
</div><Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>Recruited students</CardTitle><CardDescription>Students recruited for this company's positions.</CardDescription></CardHeader><CardContent className="space-y-4">{interns.map((application) => {
                const student = application.student!;
                return <div key={student.student_id} className="ui-card rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 space-y-3"><div className="flex flex-wrap items-center gap-3"><div><h2 className="text-lg font-semibold text-slate-900">{student.full_name}</h2><p className="text-sm text-slate-500">{student.pb_student_code}</p></div><Badge variant="outline" className={internshipStatus(student) === 'In Progress' ? 'ui-badge-success ' : internshipStatus(student) === 'Upcoming' ? 'ui-badge-info ' : internshipStatus(student) === 'Ended' ? 'ui-badge-neutral ' : 'ui-badge-warning '}>{internshipStatus(student)}</Badge></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">{student.programme?.programme_name && <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-slate-400" />{student.programme.programme_name}</span>}<span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" />{formatDate(student.internship?.start_date)} – {formatDate(student.internship?.end_date)}</span></div><div className="flex flex-wrap gap-2">{recruited.filter((candidate) => candidate.student?.student_id === student.student_id).map((candidate) => <Badge key={candidate.id} variant="secondary">{candidate.position}</Badge>)}</div></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={route('admin.students.show', student.student_id)}>View student</Link></Button><EditDialog label={student.internship ? 'Edit internship dates' : 'Set internship dates'} title="Internship Dates" description={`Set the confirmed internship period for ${student.full_name}.`} create={!student.internship}>{(close) => <InternDatesForm student={student} close={close} />}</EditDialog></div></div></div>;
            })}{!interns.length && <EmptyCompanyState text="No recruited students yet." />}</CardContent></Card></div>}
        </main>
        <Dialog open={quotaDialogOpen} onOpenChange={setQuotaDialogOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]"><DialogHeader><DialogTitle>{selectedQuota ? 'Edit Placement Request' : 'New Placement Request'}</DialogTitle><DialogDescription>{selectedQuota ? 'Update this job position and its placement requirements.' : 'Create a placement quota request for this company.'}</DialogDescription></DialogHeader>{quotaDialogOpen && <QuotaEditor key={selectedQuota?.quota_id ?? 'new'} companyId={company.company_id} branches={company.branches} programmes={programmes} academicSemesters={academicSemesters} quota={selectedQuota} close={() => setQuotaDialogOpen(false)} />}</DialogContent></Dialog>
    </AuthenticatedLayout>;
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
    return <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} className="pl-9" /></div>;
}
function EmptyCompanyState({ text }: { text: string }) {
    return <div className="rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground"><Users className="mx-auto mb-3 size-8 text-slate-400" /><p className="font-medium">{text}</p></div>;
}
function Actions({ close, processing, label = 'Save changes', disabled = false }: { close: () => void; processing: boolean; label?: string; disabled?: boolean }) {
    return <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button disabled={processing || disabled}>{processing ? 'Saving…' : label}</Button></div>;
}
function CompanyProfileForm({ company, close }: { company: Company; close: () => void }) {
    const form = useForm({ company_name: company.company_name, office_address: company.office_address ?? '', industry_sector: company.industry_sector ?? '', description: company.description ?? '', additional_information: company.additional_information ?? '', district: company.district ?? '', branches: (company.branches ?? []).map((branch) => ({ ...branch, address: branch.address ?? '', district: branch.district ?? '' })) });
    return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.put(route('admin.companies.update', company.company_id), { preserveScroll: true, onSuccess: close }); }}>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Company Name"><Input required value={form.data.company_name} onChange={(event) => form.setData('company_name', event.target.value)} /></Field><Field label="Industry Sector"><Input value={form.data.industry_sector} onChange={(event) => form.setData('industry_sector', event.target.value)} /></Field></div>
        <Field label="Office Address"><Input value={form.data.office_address} onChange={(event) => form.setData('office_address', event.target.value)} /></Field>
        <Field label="Main office district"><select value={form.data.district} onChange={(event) => form.setData('district', event.target.value)} className="ui-field w-full px-3 py-2"><option value="">Select district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></Field>
        <Field label="Description"><textarea rows={4} className="ui-textarea w-full px-3 py-2" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} /></Field>
        <Field label="Additional Information"><textarea rows={3} className="ui-textarea w-full px-3 py-2" value={form.data.additional_information} onChange={(event) => form.setData('additional_information', event.target.value)} /></Field>
        <CompanyBranchEditor branches={form.data.branches} onChange={(branches) => form.setData('branches', branches)} errors={form.errors as Record<string, string>} />
        <Errors errors={form.errors} /><Actions close={close} processing={form.processing} />
    </form>;
}

function InternDatesForm({ student, close }: { student: Student; close: () => void }) {
    const form = useForm({ start_date: date(student.internship?.start_date), end_date: date(student.internship?.end_date) });
    return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.put(route('admin.students.dates', student.student_id), { preserveScroll: true, onSuccess: close }); }}><Field label="Start date"><Input type="date" required value={form.data.start_date} onChange={(event) => form.setData('start_date', event.target.value)} /></Field><Field label="End date"><Input type="date" required min={form.data.start_date} value={form.data.end_date} onChange={(event) => form.setData('end_date', event.target.value)} /></Field><Errors errors={form.errors} /><Actions close={close} processing={form.processing} label="Save internship dates" /></form>;
}
function QuotaEditor({ companyId, branches, programmes, academicSemesters, quota, close }: { companyId: number; branches: CompanyBranch[]; programmes: Programme[]; academicSemesters: AcademicSemester[]; quota?: Quota; close: () => void }) {
    const form = useForm({ branch_ids: (quota?.branches ?? []).map((branch) => branch.id!).filter(Boolean), academic_semester_id: String(quota?.academic_semester_id ?? ''), job_title: quota?.job_title ?? '', total_slots: quota?.total_slots ?? 1, programme_ids: (quota?.programmes ?? []).map((programme) => programme.programme_id), skills: quota?.skills ?? [], interview_required: quota?.interview_required ?? false });
    const [skill, setSkill] = useState('');
    const addSkill = () => { const value = skill.trim(); if (value && !form.data.skills.includes(value)) { form.setData('skills', [...form.data.skills, value]); setSkill(''); } };
    return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const options = { preserveScroll: true, onSuccess: close }; if (quota) form.put(route('admin.quotas.update', quota.quota_id), options); else form.post(route('admin.companies.quotas.store', companyId), options); }}>
        <Field label="Job Title"><Input required value={form.data.job_title} onChange={(event) => form.setData('job_title', event.target.value)} /></Field>
        <Field label="Internship Term"><select required className="ui-field h-9 w-full px-3 py-1" value={form.data.academic_semester_id} onChange={(event) => form.setData('academic_semester_id', event.target.value)}><option value="" disabled>Select semester</option>{academicSemesters.map((semester) => <option key={semester.id} value={String(semester.id)}>{semester.name}</option>)}</select>{Boolean(quota?.applications?.length) && <p className="text-xs text-muted-foreground">Admin can correct the term if it was assigned incorrectly.</p>}</Field>
        <fieldset className="space-y-2"><legend className="text-sm font-medium">Available branches</legend><div className="space-y-2 rounded-lg border p-3">{branches.map((branch) => <label key={branch.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.branch_ids.includes(branch.id!)} onChange={(event) => form.setData('branch_ids', event.target.checked ? [...form.data.branch_ids, branch.id!] : form.data.branch_ids.filter((id) => id !== branch.id))} />{branch.name} · {branch.district || 'District not assigned'}</label>)}</div></fieldset>
        <Field label="Required Skills"><div className="flex gap-2"><Input value={skill} placeholder="e.g. React, PHP, Figma" onChange={(event) => setSkill(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } }} /><Button type="button" variant="secondary" onClick={addSkill} aria-label="Add skill"><Plus className="size-4" /></Button></div></Field>
        <div className="flex flex-wrap gap-1.5">{form.data.skills.map((value) => <Badge key={value} variant="outline" className="gap-1 ">{value}<button type="button" aria-label={`Remove ${value}`} onClick={() => form.setData('skills', form.data.skills.filter((candidate) => candidate !== value))}><X className="size-3" /></button></Badge>)}</div>
        <div className="space-y-2"><Label>Eligible Programmes (select 3–5)</Label><div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">{programmes.map((programme) => <label key={programme.programme_id} className="flex items-center gap-2 text-sm font-normal"><input type="checkbox" checked={form.data.programme_ids.includes(programme.programme_id)} disabled={form.data.programme_ids.length >= 5 && !form.data.programme_ids.includes(programme.programme_id)} onChange={(event) => form.setData('programme_ids', event.target.checked ? [...form.data.programme_ids, programme.programme_id] : form.data.programme_ids.filter((id) => id !== programme.programme_id))} />{programme.programme_name}</label>)}</div></div>
        <Field label="Total Slots"><QuotaNumberInput defaultValue={form.data.total_slots} minValue={1} onChange={(value) => form.setData('total_slots', value)} /></Field>
        <label className="flex items-center justify-between gap-3 text-sm font-medium">Interview Required<Switch checked={form.data.interview_required} onCheckedChange={(value) => form.setData('interview_required', value)} /></label>
        <Errors errors={form.errors} /><Actions close={close} processing={form.processing} label={quota ? 'Save changes' : 'Submit request'} disabled={!form.data.academic_semester_id || form.data.programme_ids.length < 3 || form.data.programme_ids.length > 5} />
    </form>;
}
