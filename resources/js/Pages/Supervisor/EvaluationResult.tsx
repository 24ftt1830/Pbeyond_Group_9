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
                <div className="mx-auto max-w-5xl space-y-6">
                    <BackButton href={backHref}>Back to Student Details</BackButton>
                    {currentSubmission.reopened_at && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Reopened by Superadmin. The previous result remains visible for reference and is pending correction before it contributes to completion.</div>}
                    {viewer === 'admin' && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
                        <ConfirmAction label="Reopen evaluation" url={route('admin.students.evaluations.reopen', { student: student.student_id, submission: currentSubmission.id })} disabled={!canReopen} description="Allow the assigned supervisor to correct and resubmit this evaluation. Preserve the original result and return final completion to Pending Evaluation." />
                        {history.length > 0 && <label className="text-sm font-semibold text-slate-700">Submitted result history<select value={historyId} onChange={(event) => setHistoryId(event.target.value)} className={inputClass + ' mt-2'}><option value="">Current submission</option>{history.map((revision) => <option key={revision.id} value={revision.id}>Before reopening · {new Date(revision.created_at).toLocaleString()}</option>)}</select></label>}
                    </div>}
                    {currentSubmission.reopened_at && ((viewer === 'academic' && currentSubmission.supervisor_type === 'Academic Supervisor') || (viewer === 'industry' && currentSubmission.supervisor_type === 'Industry Supervisor')) && <Link className={linkClass} href={route(viewer === 'academic' ? 'academic-supervisor.student.evaluate' : 'industry-supervisor.student.evaluate', student.student_id)}>Revise evaluation</Link>}

                    <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-7 shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
                        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[40px] border-white/[0.04]" />
                        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                                    {submission.supervisor_type} · Evaluation Result
                                </p>
                                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    {student.full_name}
                                </h1>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                                        <UserRound size={14} className="text-blue-200" />
                                        {student.pb_student_code}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                                        <ClipboardCheck size={14} className="text-blue-200" />
                                        {submission.template_snapshot?.name ?? 'Evaluation'} · Version {submission.template_snapshot?.version ?? submission.template_version}
                                    </span>
                                    {submission.template_snapshot?.component_weight !== undefined && (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                                            <GraduationCap size={14} className="text-blue-200" />
                                            Component weight: {submission.template_snapshot.component_weight}%
                                        </span>
                                    )}
                                </div>
                                {submission.submitted_at && (
                                    <p className="mt-3 text-sm text-blue-100/80">
                                        Submitted {new Date(submission.submitted_at).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-white shadow-inner backdrop-blur-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">{submission.reopened_at ? 'Previous evaluation score' : 'Evaluation score'}</p>
                                <p className="mt-1 text-3xl font-bold">{submission.overall_score}%</p>
                            </div>
                        </div>
                    </header>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                <ClipboardCheck size={20} />
                            </span>
                            <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">Grading Results</h2>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(groupedAnswers).map(([section, answers]) => (
                                <div key={section}>
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-bold text-slate-900">{section}</h3>
                                        {answers[0]?.section_weight !== undefined && (
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                                {answers[0].section_weight}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {answers.map((answer, index) => (
                                            <article key={`${answer.criterion}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                <h4 className="font-semibold text-slate-900">{answer.criterion}</h4>
                                                {answer.criterion_description && <p className="mt-1 text-sm leading-5 text-slate-500">{answer.criterion_description}</p>}
                                                <div className="mt-4 flex items-start justify-between gap-3 border-t border-slate-200 pt-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected level</p>
                                                        <p className="mt-1 font-semibold text-indigo-700">{answer.level}</p>
                                                    </div>
                                                    <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                                                        {answer.points} pts
                                                    </span>
                                                </div>
                                                {answer.level_description && <p className="mt-3 text-sm leading-6 text-slate-600">{answer.level_description}</p>}
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {submission.comments && (
                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <h3 className="text-sm font-bold text-slate-800">Supervisor Comments</h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{submission.comments}</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
