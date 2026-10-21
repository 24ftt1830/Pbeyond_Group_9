import { confirmAction } from '@/lib/confirm-action';
import { attendanceBasisLabel, attendanceLabel, type AttendanceSummary } from '@/lib/attendance';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Briefcase, CalendarDays, CheckCircle2, ClipboardCheck, GraduationCap, Mail, Pencil, User, UserRound } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Errors, Field, RecordFeedback } from '@/Components/Admin/RecordControls';
import ReopenLogbookButton from '@/Components/Admin/ReopenLogbookButton';
import LogbookCorrectionNotice, { type PendingLogbookCorrection } from '@/Components/LogbookCorrectionNotice';
import InternshipCompletionHistory, { type CompletionHistoryEntry } from '@/Components/InternshipCompletionHistory';
import { DecisionForm, EditDialog, EmptyState, InfoItem, RecordTabs, SectionCard, formatDate, statusTone } from '@/Components/Admin/RecordView';
import StudentProfileCards, { type StudentProfile } from '@/Components/Admin/StudentProfileCards';
import { roleLabel } from '@/lib/role-labels';

type Application = { id: number; app_status: string; interview_date?: string | null; quota?: { job_title: string; company?: { company_name: string; company_id: number } } };
type Visit = { visit_id: number; visit_date: string; notes: string };
type Assignment = { assignment_id: number; academic_supervisor_id: number; monitoring_status: string; academic_supervisor?: { full_name: string }; visits?: Visit[] };
type Evaluation = { id: number; supervisor_type: string; overall_score: number | string; submitted_at: string; reopened_at?: string | null; template_snapshot?: { name?: string } };
type Logbook = { id: number; week_start: string; week_end: string; status: string };
type Student = StudentProfile & {
    cv_snapshot?: unknown;
    user?: { email: string };
    academic_supervisor_assignments?: Assignment[];
    applications: Application[];
    internship?: { start_date: string; end_date: string } | null;
    internship_completion?: { industry_confirmation_status: string; industry_confirmed_at?: string | null; academic_completion_status: string; academic_completion_decided_at?: string | null };
    final_internship_report?: { academic_review_status: string; submitted_at?: string | null; reopened_at?: string | null; report_score?: number | string | null; report_component_weight_snapshot?: number | string | null };
};
type Attendance = AttendanceSummary;
type Props = { student: Student; evaluations: Evaluation[]; logbooks: Logbook[]; academicSupervisors: { academic_supervisor_id: number; full_name: string }[]; completionStatus: string; overallScore: number | null; canFinalizeCompleted: boolean; canFinalizeIncomplete: boolean; attendance?: Attendance; pendingLogbookCorrections?: PendingLogbookCorrection[]; completionHistory?: CompletionHistoryEntry[] };
const date = (value?: string | null) => value?.split('T')[0] ?? '';
const tabs = ['Overview', 'Background & Skills', 'Written Report & Evaluations', 'Internship Confirmation'];
const evaluationButton = 'ui-button ui-button-primary shrink-0';

export default function StudentRecord({ student, evaluations, logbooks, academicSupervisors, completionStatus, overallScore, canFinalizeCompleted, canFinalizeIncomplete, attendance, pendingLogbookCorrections = [], completionHistory = [] }: Props) {
    const [tab, setTab] = useState(tabs[0]);
    const assignment = student.academic_supervisor_assignments?.[0];
    const monitoringStatus = assignment?.monitoring_status ?? 'On Track';
    const record = student.internship_completion;
    const report = student.final_internship_report;
    const recruited = student.applications.some((application) => application.app_status === 'Recruited');
    const academic = evaluations.find((evaluation) => evaluation.supervisor_type === 'Academic Supervisor');
    const industry = evaluations.find((evaluation) => evaluation.supervisor_type === 'Industry Supervisor');
    const previousEvaluations = evaluations.filter((evaluation) => ![academic?.id, industry?.id].includes(evaluation.id));
    const reportMarked = report?.academic_review_status === 'Approved' && report.report_score != null && !report.reopened_at;
    const checklist = [
        { label: 'Company Internship Completion', state: record?.industry_confirmation_status ?? 'Pending Confirmation' },
        { label: 'PB Supervisor evaluation', state: academic?.reopened_at ? 'Pending correction' : academic ? 'Submitted' : 'Pending' },
        { label: 'Industry Supervisor evaluation', state: industry?.reopened_at ? 'Pending correction' : industry ? 'Submitted' : 'Pending' },
        { label: 'Written report', state: reportMarked ? 'Approved and marked' : report?.submitted_at ? report.academic_review_status : 'Not submitted' },
    ];

    return <AuthenticatedLayout>
        <Head title={`${student.full_name} - Student Details`} /><RecordFeedback />
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <BackButton href={route('admin.students')}>Back to Students</BackButton>
                    <div className="flex flex-wrap gap-2">{Boolean(student.cv_snapshot) && <Button asChild variant="outline"><Link href={route('admin.students.cv', student.student_id)}>View saved CV</Link></Button>}<Link className={evaluationButton + ' gap-2'} href={route('admin.students.profile', student.student_id)}><Pencil size={16} />Edit profile</Link></div>
                </div>
                <div className="ui-card border-blue-100 bg-blue-50/40 p-6">


                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-900 "><UserRound size={36} strokeWidth={1.6} /></div>
                        <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Student record</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{student.full_name}</h1>
                            <div className="mt-4 flex flex-wrap gap-2"><span className="ui-badge inline-flex items-center gap-2 border border-blue-100 bg-white text-xs font-medium text-slate-600"><User size={14} className="text-primary" />{student.pb_student_code}</span>{student.programme?.programme_name && <span className="ui-badge inline-flex items-center gap-2 border border-blue-100 bg-white text-xs font-medium text-slate-600"><GraduationCap size={14} className="text-primary" />{student.programme.programme_name}</span>}{student.intake_session && <span className="ui-badge inline-flex items-center gap-2 border border-blue-100 bg-white text-xs font-medium text-slate-600"><CalendarDays size={14} className="text-primary" />{student.intake_session}</span>}<span className={'ui-badge ' + ('inline-flex items-center gap-2 border text-xs ' + statusTone(monitoringStatus))}><span className="h-1.5 w-1.5 rounded-full bg-current" />{monitoringStatus}</span></div>
                        </div>
                    </div>
                </div>
            </div></header>

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 pb-16 sm:px-6 lg:px-8">
                <LogbookCorrectionNotice weeks={pendingLogbookCorrections} />
                <RecordTabs tabs={tabs} value={tab} onChange={setTab} label="Student details" />
                {tab === tabs[0] && <div className="space-y-6">
                    <StudentProfileCards student={student} tab="overview" />
                    <SectionCard title="Contact Information" icon={<Mail size={20} />}><InfoItem label="Email Address" value={student.user?.email} /></SectionCard>
                    {attendance && <SectionCard title="Attendance" icon={<CalendarDays size={20} />}><div className="grid gap-4 sm:grid-cols-4"><InfoItem label="Attendance" value={attendanceLabel(attendance)} /><InfoItem label="Credited / approved recorded days" value={`${attendance.credited_days} / ${attendance.recorded_days}`} /><InfoItem label="Absent days" value={attendance.absent_days} /><InfoItem label="Internship days" value={attendance.total_days} /></div><p className="mt-4 text-sm text-slate-500">Work days, permission/MC and public holidays count toward attendance after Industry Supervisor approval. {attendanceBasisLabel(attendance)}</p><p className="mt-1 text-sm text-slate-500">{attendance.elapsed_days} / {attendance.total_days} internship days actually elapsed. Elapsed days in unapproved weeks: {attendance.unapproved_days}. Unrecorded elapsed days: {attendance.missing_days}.</p></SectionCard>}
                    <SectionCard title="Supervisor Assignments" icon={<GraduationCap size={20} />} action={<EditDialog label={assignment ? 'Edit PB assignment' : 'Assign PB Supervisor'} title={assignment ? 'PB Supervisor Assignment' : 'Assign PB Supervisor'} description="Choose the PB Supervisor responsible for this student. Their final completion decision returns to pending if the assignment changes.">{(close) => <AssignmentForm studentId={student.student_id} assignment={assignment} supervisors={academicSupervisors} close={close} />}</EditDialog>}>
                        {assignment?.academic_supervisor?.full_name ? <InfoItem label="PB Supervisor" value={assignment.academic_supervisor.full_name} /> : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4"><p className="text-sm font-medium text-slate-700">No PB Supervisor assigned</p><p className="mt-1 text-sm text-slate-500">Assign one when this student is ready for supervision.</p></div>}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Industry Supervisors are assigned to individual recruited students.</p><Button asChild variant="outline" size="sm"><Link href={route('admin.supervisors')}>Manage industry assignment</Link></Button></div>
                    </SectionCard>
                    <SectionCard title="Applications" icon={<Briefcase size={20} />}>{student.applications.length ? <div className="divide-y divide-slate-100">{student.applications.map((application) => <div key={application.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                        <div><h3 className="font-semibold text-slate-900">{application.quota?.job_title ?? 'Position'}</h3><p className="mt-1 text-sm text-slate-500">{application.quota?.company?.company_name ?? 'Company'} · {application.app_status}</p>{application.interview_date && <p className="mt-1 text-sm text-slate-500">Interview: {formatDate(application.interview_date)}</p>}</div>
                        <div className="flex flex-wrap gap-2">{application.quota?.company && <Button asChild size="sm" variant="outline"><Link href={route('admin.companies.manage', application.quota.company.company_id)}>View company</Link></Button>}<EditDialog label="Edit application" title="Application Status" description="Update the recruitment decision for this job position.">{(close) => <ApplicationForm application={application} close={close} />}</EditDialog></div>
                    </div>)}</div> : <EmptyState text="No applications submitted yet." />}</SectionCard>
                    <SectionCard title="Internship Dates" icon={<CalendarDays size={20} />} action={<EditDialog label={student.internship ? 'Edit dates' : 'Set dates'} title="Internship Dates" description="Set the student's actual internship start and end dates." disabled={!recruited}>{(close) => <DatesForm student={student} close={close} />}</EditDialog>}>
                        <div className="grid gap-4 sm:grid-cols-2"><InfoItem label="Start date" value={formatDate(student.internship?.start_date)} /><InfoItem label="End date" value={formatDate(student.internship?.end_date)} /></div>{!recruited && <p className="mt-4 text-sm text-slate-500">Internship dates can be set after recruitment.</p>}
                    </SectionCard>
                    <SectionCard title="Internship Visits" icon={<CalendarDays size={20} />} action={<EditDialog label="Record visit" title="Record Internship Visit" description="Add a visit for this student's assigned class." create disabled={!assignment}>{(close) => <VisitForm studentId={student.student_id} close={close} />}</EditDialog>}>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div><h3 className="font-semibold text-slate-900">Monitoring Status</h3><p className="mt-1 text-sm text-slate-500">{monitoringStatus} · Applies to the student's class</p></div><EditDialog label="Edit monitoring" title="Class Monitoring" description="Update the monitoring status for students in this class." disabled={!assignment}>{(close) => <DecisionForm url={route('admin.students.monitoring', student.student_id)} field="monitoring_status" label="Monitoring status" value={monitoringStatus} options={['On Track', 'Needs Attention', 'At Risk'].map((value) => ({ value }))} close={close} />}</EditDialog></div>
                        {(assignment?.visits ?? []).length ? <div className="space-y-4">{assignment!.visits!.map((visit) => <div key={visit.visit_id} className="ui-card rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">{formatDate(visit.visit_date)}</h3><EditDialog label="Edit visit" title="Edit Internship Visit" description="Update the recorded visit date and notes.">{(close) => <VisitForm studentId={student.student_id} visit={visit} close={close} />}</EditDialog></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{visit.notes}</p></div>)}</div> : <EmptyState text="No internship visits recorded yet." />}
                    </SectionCard>
                </div>}
                {tab === tabs[1] && <StudentProfileCards student={student} tab="profile" />}
                {tab === tabs[2] && <div className="space-y-6">
                    <section className="ui-card rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Final Internship Report</h2><p className="mt-1 text-sm text-slate-500">{report?.submitted_at ? `PB review: ${report.academic_review_status}` : 'The student has not submitted a final report yet.'}</p>{reportMarked && report?.report_component_weight_snapshot != null && <p className="mt-1 text-sm text-slate-500">Written report: {((Number(report.report_score) * Number(report.report_component_weight_snapshot)) / 100).toFixed(2)}% of {Number(report.report_component_weight_snapshot).toFixed(2)}% available</p>}<p className="mt-1 text-sm font-semibold text-primary">Overall evaluation (PB + Industry + Written Report): {overallScore === null ? 'Pending Evaluation' : overallScore.toFixed(2) + '%'}</p></div><div className="flex flex-wrap items-center gap-3"><span className={'ui-badge ' + (' text-xs font-medium ' + statusTone(completionStatus))}>{completionStatus}</span><Link href={route('admin.students.report', student.student_id)} className="ui-button ui-button-primary rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">View report</Link></div></div></section>
                    <SectionCard title="Supervisor Evaluations" icon={<ClipboardCheck size={20} />}>
                        <div className="divide-y divide-slate-200">{['Academic Supervisor', 'Industry Supervisor'].map((type) => {
                            const evaluation = type === 'Academic Supervisor' ? academic : industry;
                            return <div key={type} className="flex flex-wrap items-center justify-between gap-3 py-5 first:pt-0 last:pb-0"><div><h3 className="text-base font-semibold text-slate-900">{roleLabel(type)} Evaluation</h3><p className="mt-1 text-sm text-slate-500">{evaluation ? evaluation.reopened_at ? `Pending correction · Previous score ${evaluation.overall_score}%` : `${roleLabel(evaluation.template_snapshot?.name ?? type + ' Evaluation')} · Score ${evaluation.overall_score}%` : 'No evaluation submitted yet.'}</p></div>{evaluation && <Link className={evaluationButton} href={route('admin.students.evaluations.show', { student: student.student_id, submission: evaluation.id })}>View Evaluation</Link>}</div>;
                        })}</div>
                        {previousEvaluations.length > 0 && <details className="mt-5 border-t border-slate-100 pt-5"><summary className="cursor-pointer text-sm font-semibold text-slate-700">Previous evaluations ({previousEvaluations.length})</summary><div className="mt-3 divide-y divide-slate-100">{previousEvaluations.map((evaluation) => <div key={evaluation.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><p className="text-sm text-slate-500">{evaluation.supervisor_type} · {formatDate(evaluation.submitted_at)} · {evaluation.overall_score}%</p><Button asChild variant="outline" size="sm"><Link href={route('admin.students.evaluations.show', { student: student.student_id, submission: evaluation.id })}>View evaluation</Link></Button></div>)}</div></details>}
                    </SectionCard>
                    <SectionCard title="Weekly Logbooks" icon={<ClipboardCheck size={20} />}>{logbooks.length ? <div className="divide-y divide-slate-100">{logbooks.map((week) => <div key={week.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h3 className="font-semibold text-slate-900">{formatDate(week.week_start)} – {formatDate(week.week_end)}</h3><p className="mt-1 text-sm capitalize text-slate-500">{week.status.replaceAll('_', ' ')}</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={route('admin.logbooks.review', week.id)}>View / review</Link></Button>{['approved', 'reviewed'].includes(week.status) && <ReopenLogbookButton url={route('admin.students.logbooks.reopen', { student: student.student_id, submission: week.id })} />}</div></div>)}</div> : <EmptyState text="No weekly logbooks submitted yet." />}</SectionCard>
                </div>}
                {tab === tabs[3] && <div className="space-y-6">
                    <SectionCard title="Company Internship Completion" icon={<Briefcase size={20} />} action={<EditDialog label={record?.industry_confirmation_status && record.industry_confirmation_status !== 'Pending Confirmation' ? 'Edit confirmation' : 'Record confirmation'} title="Company Internship Completion" description="Changing this confirmation returns the final school decision to Pending Evaluation." disabled={!recruited}>{(close) => <DecisionForm url={route('admin.students.company-confirmation', student.student_id)} label="Company confirmation" value={record?.industry_confirmation_status === 'Pending Confirmation' ? '' : record?.industry_confirmation_status ?? ''} options={[{ value: 'Confirmed' }, { value: 'Changes Required' }]} close={close} />}</EditDialog>}>
                        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">The company's internship confirmation is recorded independently of the written report review.</p><span className={'ui-badge ' + (' text-xs font-medium ' + statusTone(record?.industry_confirmation_status ?? 'Pending Confirmation'))}>{record?.industry_confirmation_status ?? 'Pending Confirmation'}</span></div>{record?.industry_confirmed_at && <p className="mt-4 text-sm text-slate-500">Confirmed {formatDate(record.industry_confirmed_at)}</p>}{!recruited && <p className="mt-4 text-sm text-slate-500">A recruited placement is required.</p>}
                    </SectionCard>
                    <SectionCard title="Internship Completion Decision" icon={<CheckCircle2 size={20} />}>
                        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Final completion requires the company confirmation, both supervisor evaluations and the written report review.</p><span className={'ui-badge ' + (' text-xs font-medium ' + statusTone(completionStatus))}>{completionStatus}</span></div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">{checklist.map((item) => { const ready = ['Confirmed', 'Submitted', 'Approved and marked'].includes(item.state); return <div key={item.label} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"><span className={'h-2.5 w-2.5 shrink-0 rounded-full ' + (ready ? 'bg-emerald-500' : 'bg-amber-500')} /><span className="text-slate-700">{item.label}</span><span className={'ml-auto text-xs font-semibold ' + (ready ? 'text-emerald-700' : 'text-amber-700')}>{item.state}</span></div>; })}</div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><p className="text-sm text-slate-600">Decision recorded: <span className="font-semibold text-slate-900">{record?.academic_completion_status ?? 'Pending Evaluation'}</span>{record?.academic_completion_decided_at ? ` · ${formatDate(record.academic_completion_decided_at)}` : ''}</p><EditDialog label={record?.academic_completion_status && record.academic_completion_status !== 'Pending Evaluation' ? 'Edit decision' : 'Record decision'} title="Final Internship Decision" description="Choose the final decision after the required evaluations and confirmations are complete." disabled={!canFinalizeCompleted && !canFinalizeIncomplete}>{(close) => <DecisionForm url={route('admin.students.completion', student.student_id)} field="decision" label="Final decision" value={['Completed', 'Incomplete'].includes(record?.academic_completion_status ?? '') ? record!.academic_completion_status : ''} options={[{ value: 'Completed', disabled: !canFinalizeCompleted }, { value: 'Incomplete', disabled: !canFinalizeIncomplete }]} close={close} />}</EditDialog></div>
                        <InternshipCompletionHistory entries={completionHistory} />
                    </SectionCard>
                </div>}
            </main>
        </div>
    </AuthenticatedLayout>;
}

function FormActions({ close, processing, label = 'Save changes' }: { close: () => void; processing: boolean; label?: string }) {
    return <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button disabled={processing}>{processing ? 'Saving…' : label}</Button></div>;
}
function ApplicationForm({ application, close }: { application: Application; close: () => void }) {
    const form = useForm({ status: application.app_status, interview_date: date(application.interview_date) });
    return <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); if (form.processing) return; if (form.data.status === 'Declined' && !(await confirmAction('Reject this application? The student will be notified.'))) return; if (form.data.status === 'Recruited' && !(await confirmAction('Accept this application and recruit this student? The student will be notified.', { title: 'Accept application?', confirmLabel: 'Accept application' }))) return; form.put(route('admin.applications.update', application.id), { preserveScroll: true, onSuccess: close }); }}><p className="text-sm text-slate-500">Company HR cannot change accepted or declined decisions. Admin can correct the decision or reopen the application here.</p><Field label="Application status"><select className="ui-field w-full px-3 py-2" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>{['Pending', 'Interviewing', 'Recruited', 'Declined'].map((status) => <option key={status}>{status}</option>)}</select></Field>{form.data.status === 'Interviewing' && <Field label="Interview date"><Input type="date" value={form.data.interview_date} onChange={(event) => form.setData('interview_date', event.target.value)} /></Field>}<Errors errors={form.errors} /><FormActions close={close} processing={form.processing} /></form>;
}
function DatesForm({ student, close }: { student: Student; close: () => void }) {
    const form = useForm({ start_date: date(student.internship?.start_date), end_date: date(student.internship?.end_date) });
    return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.put(route('admin.students.dates', student.student_id), { preserveScroll: true, onSuccess: close }); }}><div className="grid gap-4 sm:grid-cols-2"><Field label="Start date"><Input required type="date" value={form.data.start_date} onChange={(event) => form.setData('start_date', event.target.value)} /></Field><Field label="End date"><Input required type="date" min={form.data.start_date} value={form.data.end_date} onChange={(event) => form.setData('end_date', event.target.value)} /></Field></div><Errors errors={form.errors} /><FormActions close={close} processing={form.processing} label="Save internship dates" /></form>;
}
function AssignmentForm({ studentId, assignment, supervisors, close }: { studentId: number; assignment?: Assignment; supervisors: Props['academicSupervisors']; close: () => void }) {
    const form = useForm({ academic_supervisor_id: String(assignment?.academic_supervisor_id ?? '') });
    return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.put(route('admin.students.academic-assignment', studentId), { preserveScroll: true, onSuccess: close }); }}><Field label="PB Supervisor"><select required className="ui-field w-full px-3 py-2" value={form.data.academic_supervisor_id} onChange={(event) => form.setData('academic_supervisor_id', event.target.value)}><option value="">Select supervisor</option>{supervisors.map((supervisor) => <option key={supervisor.academic_supervisor_id} value={supervisor.academic_supervisor_id}>{supervisor.full_name}</option>)}</select></Field><Errors errors={form.errors} /><FormActions close={close} processing={form.processing} /></form>;
}
function VisitForm({ studentId, visit, close }: { studentId: number; visit?: Visit; close: () => void }) {
    const form = useForm({ visit_date: date(visit?.visit_date), notes: visit?.notes ?? '' });
    return <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const options = { preserveScroll: true, onSuccess: close }; if (visit) form.put(route('admin.students.visits.update', { student: studentId, visit: visit.visit_id }), options); else form.post(route('admin.students.visits', studentId), options); }}><Field label="Visit date"><Input required type="date" value={form.data.visit_date} onChange={(event) => form.setData('visit_date', event.target.value)} /></Field><Field label="Visit notes"><textarea required rows={4} className="ui-textarea w-full px-3 py-2" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} /></Field><Errors errors={form.errors} /><FormActions close={close} processing={form.processing} label={visit ? 'Save visit changes' : 'Record visit'} /></form>;
}
