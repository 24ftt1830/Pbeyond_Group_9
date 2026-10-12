import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Clock3, ClipboardCheck, FileText } from 'lucide-react';
import { useState } from 'react';
import BackButton from '@/Components/BackButton';
import { ConfirmAction, RecordFeedback, RecordPanel } from '@/Components/Admin/RecordControls';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

type RatingLevel = { id: number; title: string; description?: string | null; points: number };
type Criterion = { id: number; title: string; description?: string | null; rating_levels: RatingLevel[] };
type Section = { id: number; title: string; description?: string | null; weight: number | string; criteria: Criterion[] };
type Rubric = { id: number; name: string; version: number; sections: Section[] };
type Answer = { level_id: number; level?: string; points?: number; criterion?: string; section?: string; level_description?: string };
type Report = {
    reopened_at?: string | null;
    title: string;
    submitted_at?: string | null;
    academic_review_status: 'Pending Review' | 'Approved' | 'Changes Required';
    report_score?: number | string | null;
    report_component_weight_snapshot?: number | string | null;
    academic_review_comments?: string | null;
    report_answers?: Record<string, Answer> | null;
};
type CompletionRecord = {
    industry_confirmation_status: 'Pending Confirmation' | 'Confirmed' | 'Changes Required';
    industry_confirmed_at?: string | null;
    academic_completion_status: 'Pending Evaluation' | 'Completed' | 'Incomplete';
    academic_completion_decided_at?: string | null;
};
type Props = {
    student: { student_id: number; full_name: string; pb_student_code: string };
    report: Report | null;
    viewer: 'student' | 'academic' | 'admin';
    reviewLocked?: boolean;
    reviewHistory?: { id: number; before_snapshot: Report; created_at: string }[];
    reportRubric: Rubric | null;
    completionStatus: 'Pending Evaluation' | 'Incomplete' | 'Completed';
    overallScore: number | null;
    reportDownloadUrl: string | null;
    studentWrittenReportWeight: number | string;
    completionRecord: CompletionRecord | null;
};

const tone = (status: string) => status === 'Completed' || status === 'Approved'
    ? 'bg-emerald-100 text-emerald-800' : status === 'Incomplete' || status === 'Changes Required'
        ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';

export default function FinalInternshipReport({ student, report, viewer, reportRubric, completionStatus, overallScore, reportDownloadUrl, studentWrittenReportWeight, completionRecord, reviewLocked = false, reviewHistory = [] }: Props) {
    const isStudent = viewer === 'student';
    const isAdmin = viewer === 'admin';
    const reportMark = report?.report_score == null ? null : Number(report.report_score);
    const reportWeight = Number(report?.report_component_weight_snapshot ?? studentWrittenReportWeight);
    const reportContribution = reportMark === null ? null : (reportMark * reportWeight) / 100;
    const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
    const { data, setData, post, transform, processing, errors } = useForm<{ title: string; pdf: File | null; submit: boolean }>({
        title: report?.title ?? '', pdf: null, submit: false,
    });
    const review = useForm<{ status: 'Approved' | 'Changes Required'; answers: Record<string, string>; comments: string }>({
        status: report?.academic_review_status === 'Changes Required' ? 'Changes Required' : 'Approved',
        answers: Object.fromEntries(Object.entries(report?.report_answers ?? {}).map(([id, answer]) => [id, String(answer.level_id)])),
        comments: report?.academic_review_comments ?? '',
    });

    const submitReport = () => {
        transform((formData) => ({ ...formData, submit: true }));
        post(route('student.final-report.save'), { forceFormData: true, preserveScroll: true });
    };
    const submitReview = () => review.put(route('academic-supervisor.student.final-report.review', student.student_id), { preserveScroll: true });

    return <AuthenticatedLayout>
        <RecordFeedback />
        <Head title="Student Written Report" />
        <main className={`mx-auto w-full ${isStudent ? 'max-w-4xl' : 'max-w-5xl'} space-y-6 p-5 md:p-8`}>
            {!isStudent && <BackButton href={route(isAdmin ? 'admin.students.show' : 'academic-supervisor.student.show', student.student_id)}>Back to Student Details</BackButton>}
            <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">{isStudent ? <FileText /> : <ClipboardCheck />}</div><div><p className="text-sm font-semibold text-indigo-700">{isStudent ? 'Student Written Report' : isAdmin ? 'Superadmin · Student Written Report' : 'Academic Supervisor · Student Written Report'} · {reportWeight}% of final score</p><h1 className="text-2xl font-bold text-slate-900">{isStudent ? 'Your final internship report' : 'Written Report Evaluation'}</h1><p className="mt-1 text-sm text-slate-500">{isStudent ? 'Upload your final report as a PDF. Your Academic Supervisor will grade it.' : `${student.full_name} · ${student.pb_student_code}`}</p></div></div>
                    <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${tone(completionStatus)}`}>{completionStatus}</span>
                </div>
            </header>
            {report?.reopened_at && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Superadmin reopened this review for the Academic Supervisor to correct. Any previous mark shown below is retained for reference; the report is pending review.</p>}
            {viewer === 'academic' && reviewLocked && <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">This review is submitted and locked. Superadmin can reopen it for correction.</p>}
            {isAdmin && report?.submitted_at && <RecordPanel title="Academic Review" action={<ConfirmAction label="Reopen report review" url={route('admin.students.report.reopen', student.student_id)} disabled={!reviewLocked} description="Allow the assigned Academic Supervisor to correct this review. Preserve its original marking and return completion to Pending Evaluation." />}><p className="text-sm text-slate-600">{report.academic_review_status}</p></RecordPanel>}

            {isStudent && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-slate-900">Internship completion progress</h2>
                        <p className="mt-1 text-sm text-slate-500">Your Industry Supervisor confirms company completion. Your Academic Supervisor makes the final school completion decision.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${tone(completionStatus)}`}>{completionStatus}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <CompletionStatusItem label="Company placement" status={completionRecord?.industry_confirmation_status ?? 'Pending Confirmation'} />
                    <CompletionStatusItem label="Final school decision" status={completionRecord?.academic_completion_status ?? 'Pending Evaluation'} />
                </div>
            </section>}

            {!isStudent && reportMark !== null && <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Evaluation score summary</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <ScoreSummary label={report?.reopened_at ? 'Previous written report mark' : 'Written report mark'} value={`${reportMark.toFixed(2)}%`} detail="The Academic Supervisor's rubric result" />
                    <ScoreSummary label={report?.reopened_at ? 'Previous contribution (pending correction)' : 'Earned toward final score'} value={`${reportContribution?.toFixed(2)}%`} detail={`Of ${reportWeight.toFixed(2)}% available for the report`} />
                </div>
            </section>}

            {isStudent ? <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div><label className="mb-2 block text-sm font-semibold">Report title</label><input value={data.title} onChange={(event) => setData('title', event.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Final Internship Report" />{errors.title && <p className="mt-1 text-sm text-rose-600">{errors.title}</p>}</div>
                <div><label className="mb-2 block text-sm font-semibold">PDF file</label><input type="file" accept="application/pdf,.pdf" onChange={(event) => setData('pdf', event.target.files?.[0] ?? null)} className="w-full rounded-lg border px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700" /><p className="mt-1 text-xs text-slate-500">PDF only, maximum 20 MB.{report?.submitted_at ? ' Upload a replacement PDF when resubmitting changes.' : ''}</p>{errors.pdf && <p className="mt-1 text-sm text-rose-600">{errors.pdf}</p>}</div>
                {report?.submitted_at && <p className="text-sm text-slate-600">Your PDF was submitted on {new Date(report.submitted_at).toLocaleString()}.</p>}
                {report?.academic_review_comments && <Notice title="Academic Supervisor feedback" status={report.academic_review_status} text={report.academic_review_comments} />}
                {report?.academic_review_status === 'Approved' && report?.report_score !== null && report?.report_score !== undefined && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">Written report mark: <strong>{report.report_score}%</strong> · contributes {report.report_component_weight_snapshot ?? studentWrittenReportWeight}% to the overall result.</div>}
                {overallScore !== null && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">Final overall evaluation score: <strong>{overallScore}%</strong></div>}
                <div className="flex flex-wrap justify-end gap-3"><AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}><button disabled={processing} type="button" onClick={() => setConfirmSubmitOpen(true)} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60">Submit PDF for review</button><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Submit final report for review?</AlertDialogTitle><AlertDialogDescription>Your PDF will be sent to your assigned Academic Supervisor for marking. Confirm when you are ready to submit.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={processing}>Go back</AlertDialogCancel><AlertDialogAction disabled={processing} onClick={submitReport}>{processing ? 'Submitting…' : 'Confirm submission'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
            </section> : !report?.submitted_at ? <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500"><Clock3 className="mx-auto mb-3" />The student has not submitted a final report yet.</section> : <>
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{report.title || 'Final Internship Report'}</h2><p className="mt-1 text-sm text-slate-500">Submitted {new Date(report.submitted_at).toLocaleString()}</p></div>{reportDownloadUrl && <a href={reportDownloadUrl} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">Open submitted PDF</a>}</div></section>
                {report.academic_review_comments && <Notice title="Previous feedback" status={report.academic_review_status} text={report.academic_review_comments} />}
                {isAdmin && <RecordPanel title="Submitted Marking"><SavedReportReview report={report} /></RecordPanel>}
                {isAdmin && reviewHistory.length > 0 && <RecordPanel title="Original Submitted Reviews"><div className="space-y-4">{reviewHistory.map((revision) => <details key={revision.id} className="rounded-xl border bg-slate-50 p-4"><summary className="cursor-pointer font-semibold">Before reopening · {new Date(revision.created_at).toLocaleString()}</summary><div className="mt-4"><SavedReportReview report={revision.before_snapshot} /></div></details>)}</div></RecordPanel>}
                {viewer === 'academic' && <form onSubmit={(event) => { event.preventDefault(); submitReview(); }} className="space-y-5">
                    <fieldset disabled={reviewLocked} className="space-y-5">
                    {!reportRubric ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">The written report grading rubric is not active yet. Ask the Admin to seed and activate the evaluation templates.</section> : reportRubric.sections.map((section) => <section key={section.id} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">{section.title}</h2>{section.description && <p className="mt-1 text-sm text-slate-500">{section.description}</p>}</div><span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{section.weight}%</span></div>
                        {section.criteria.map((criterion) => <fieldset key={criterion.id} className="border-t pt-4">
                            <legend className="font-semibold text-slate-800">{criterion.title}</legend>
                            {criterion.description && <p className="mb-3 mt-1 text-sm text-slate-500">{criterion.description}</p>}
                            <div className="grid gap-3 md:grid-cols-2" role="group" aria-label={`Grading levels for ${criterion.title}`}>
                                {criterion.rating_levels.map((level) => {
                                    const selected = Number(review.data.answers[String(criterion.id)]) === level.id;

                                    return <button
                                        key={level.id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => review.setData('answers', { ...review.data.answers, [String(criterion.id)]: String(level.id) })}
                                        className={`cursor-pointer rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${selected ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'bg-white hover:border-slate-300'}`}
                                    >
                                        <span className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900">{level.title}</span><span className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-600">{level.points} pts</span></span>
                                        {level.description && <span className="mt-2 block text-sm leading-5 text-slate-600">{level.description}</span>}
                                    </button>;
                                })}
                            </div>
                            {review.errors[`answers.${criterion.id}`] && <p className="mt-2 text-sm text-rose-600">{review.errors[`answers.${criterion.id}`]}</p>}
                        </fieldset>)}
                    </section>)}
                    {review.errors.answers && <p className="text-sm text-rose-600">{review.errors.answers}</p>}
                    <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"><label className="block font-semibold text-slate-800">Review result<select value={review.data.status} onChange={(event) => review.setData('status', event.target.value as 'Approved' | 'Changes Required')} className="mt-2 w-full rounded-lg border px-3 py-2"><option>Approved</option><option>Changes Required</option></select></label><label className="mb-2 block font-semibold text-slate-800">Additional comments<textarea value={review.data.comments} onChange={(event) => review.setData('comments', event.target.value)} rows={4} className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="Optional feedback for the student" /></label>{review.errors.comments && <p className="text-sm text-rose-600">{review.errors.comments}</p>}</section>
                    <div className="flex justify-end"><button disabled={review.processing || !reportRubric || reviewLocked} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{review.processing ? 'Submitting…' : report.reopened_at ? 'Resubmit corrected report evaluation' : 'Save report evaluation'}</button></div>
                    </fieldset>
                </form>}
            </>}
        </main>
    </AuthenticatedLayout>;
}

function SavedReportReview({ report }: { report: Report }) {
    return <div className="space-y-3"><p className="font-semibold">{report.academic_review_status} · {report.report_score == null ? 'No mark recorded' : 'Mark ' + report.report_score + '%'}</p>{Object.values(report.report_answers ?? {}).map((answer, index) => <div key={index} className="rounded-lg border bg-white p-3"><p className="font-semibold">{answer.criterion ?? 'Criterion'}</p><p className="mt-1 text-sm text-slate-600">{answer.level} · {answer.points} pts</p>{answer.level_description && <p className="mt-2 text-sm text-slate-500">{answer.level_description}</p>}</div>)}{report.academic_review_comments && <p className="whitespace-pre-wrap text-sm text-slate-600">{report.academic_review_comments}</p>}</div>;
}

function ScoreSummary({ label, value, detail }: { label: string; value: string; detail: string }) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>;
}

function CompletionStatusItem({ label, status, detail }: { label: string; status: string; detail?: string | null }) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 font-semibold text-slate-900">{status}</p>
        {detail && <p className="mt-1 text-sm text-slate-600">{detail}</p>}
    </div>;
}

function Notice({ title, text, status }: { title: string; text: string; status: string }) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2"><p className="font-semibold">{title}</p><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tone(status)}`}>{status}</span></div><p className="mt-2 text-sm text-slate-600">{text}</p></div>;
}
