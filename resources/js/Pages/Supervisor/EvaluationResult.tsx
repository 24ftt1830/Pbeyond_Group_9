import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ConfirmAction, RecordFeedback, inputClass, linkClass } from '@/Components/Admin/RecordControls';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { ClipboardCheck, GraduationCap, UserRound } from 'lucide-react';

type Answer = {
    section: string;
    section_weight?: number | string;
    criterion: string;
    criterion_description?: string | null;
    level: string;
    level_description?: string | null;
    points: number;
};

type Submission = {
    id: number;
    reopened_at?: string | null;
    supervisor_type: 'Academic Supervisor' | 'Industry Supervisor';
    template_version: number;
    template_snapshot: {
        name?: string;
        version?: number;
        component_weight?: number | string;
    };
    answers: Record<string, Answer>;
    overall_score: number | string;
    comments?: string | null;
    submitted_at?: string | null;
};

type Student = {
    student_id: number;
    pb_student_code: string;
    full_name: string;
};

export default function EvaluationResult({
    student,
    submission: currentSubmission,
    viewer,
    canReopen = false,
    history = [],
}: {
    student: Student;
    submission: Submission;
    viewer: 'academic' | 'industry' | 'admin';
    canReopen?: boolean;
    history?: { id: number; before_snapshot: Submission; created_at: string }[];
}) {
    const [historyId, setHistoryId] = useState('');
    const submission = history.find((revision) => String(revision.id) === historyId)?.before_snapshot ?? currentSubmission;
    const groupedAnswers = Object.values(submission.answers ?? {}).reduce<Record<string, Answer[]>>((groups, answer) => {
        const section = answer.section || 'Evaluation';
        (groups[section] ??= []).push(answer);
        return groups;
    }, {});

    const backHref = viewer === 'admin' ? route('admin.students.show', student.student_id) : viewer === 'academic'
        ? route('academic-supervisor.student.show', student.student_id)
        : route('industry-supervisor.student.show', student.student_id);

    return (
        <AuthenticatedLayout>
            <RecordFeedback />
            <Head title={`${submission.supervisor_type} Evaluation · ${student.full_name}`} />

            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-5">
                    <BackButton href={backHref}>Back to Student Details</BackButton>
                    {currentSubmission.reopened_at && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Reopened by Superadmin. The previous result remains visible for reference and is pending correction before it contributes to completion.</div>}
                    {viewer === 'admin' && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
                        <ConfirmAction label="Reopen evaluation" url={route('admin.students.evaluations.reopen', { student: student.student_id, submission: currentSubmission.id })} disabled={!canReopen} description="Allow the assigned supervisor to correct and resubmit this evaluation. Preserve the original result and return final completion to Pending Evaluation." />
                        {history.length > 0 && <label className="text-sm font-semibold text-slate-700">Submitted result history<select value={historyId} onChange={(event) => setHistoryId(event.target.value)} className={inputClass + ' mt-2'}><option value="">Current submission</option>{history.map((revision) => <option key={revision.id} value={revision.id}>Before reopening · {new Date(revision.created_at).toLocaleString()}</option>)}</select></label>}
                    </div>}
                    {currentSubmission.reopened_at && ((viewer === 'academic' && currentSubmission.supervisor_type === 'Academic Supervisor') || (viewer === 'industry' && currentSubmission.supervisor_type === 'Industry Supervisor')) && <Link className={linkClass} href={route(viewer === 'academic' ? 'academic-supervisor.student.evaluate' : 'industry-supervisor.student.evaluate', student.student_id)}>Revise evaluation</Link>}

                    <header className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white px-5 py-5 sm:px-6">
                        <div className="flex min-w-0 items-start gap-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><ClipboardCheck size={20} /></span>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{submission.supervisor_type} · Evaluation result</p>
                                <h1 className="mt-1 break-words font-sato text-2xl font-bold text-slate-900 sm:text-3xl">{student.full_name}</h1>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                    <span className="inline-flex items-center gap-1.5"><UserRound size={14} />{student.pb_student_code}</span>
                                    <span>{submission.template_snapshot?.name ?? 'Evaluation'} · Version {submission.template_snapshot?.version ?? submission.template_version}</span>
                                    {submission.template_snapshot?.component_weight !== undefined && <span className="inline-flex items-center gap-1.5"><GraduationCap size={14} />{submission.template_snapshot.component_weight}% of final score</span>}
                                </div>
                                {submission.submitted_at && <p className="mt-1.5 text-xs text-slate-400">Submitted {new Date(submission.submitted_at).toLocaleString()}</p>}
                            </div>
                        </div>
                        <div className="min-w-32 rounded-lg bg-slate-50 px-4 py-3 text-right">
                            <p className="text-xs font-medium text-slate-500">{submission.reopened_at ? 'Previous score' : 'Evaluation score'}</p>
                            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{submission.overall_score}%</p>
                        </div>
                    </header>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-base font-semibold text-slate-900">Grading results</h2></div>
                        <div className="divide-y divide-slate-100 px-5 sm:px-6">
                            {Object.entries(groupedAnswers).map(([section, answers], sectionIndex) => (
                                <div key={section} className="py-4 first:pt-5 last:pb-5">
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-slate-800"><span className="mr-2 text-xs font-medium tabular-nums text-slate-400">{String(sectionIndex + 1).padStart(2, '0')}</span>{section}</h3>
                                        {answers[0]?.section_weight !== undefined && <span className="text-xs tabular-nums text-slate-500">{answers[0].section_weight}%</span>}
                                    </div>
                                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                                        {answers.map((answer, index) => <article key={`${answer.criterion}-${index}`} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-start sm:gap-5">
                                            <div><h4 className="text-sm font-medium text-slate-800">{answer.criterion}</h4>{answer.criterion_description && <p className="mt-0.5 text-sm leading-5 text-slate-500">{answer.criterion_description}</p>}</div>
                                            <div><p className="text-sm font-medium text-indigo-700">{answer.level}</p>{answer.level_description && <p className="mt-0.5 text-sm leading-5 text-slate-500">{answer.level_description}</p>}</div>
                                            <span className="text-xs font-semibold tabular-nums text-slate-500 sm:pt-1">{answer.points} pts</span>
                                        </article>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {submission.comments && <div className="border-t border-slate-100 px-5 py-4 sm:px-6"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supervisor comments</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{submission.comments}</p></div>}
                    </section>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
