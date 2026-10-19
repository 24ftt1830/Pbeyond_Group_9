import { roleLabel } from '@/lib/role-labels';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';
import BackButton from '@/Components/BackButton';
import GradingSection from '@/Components/Evaluations/GradingSection';
import { evaluationInputClass } from '@/Components/Evaluations/RubricEditor';
import type { FormEvent } from 'react';

type Level = { id: number; title: string; description?: string | null; points: number };
type Criterion = { id: number; title: string; description?: string | null; rating_levels: Level[]; ratingLevels?: Level[] };
type Section = { id: number; title: string; description?: string | null; weight: number; criteria: Criterion[] };
type Template = { id: number; name: string; version: number; component_weight: number | string; sections: Section[] };
type Student = { student_id: number; pb_student_code?: string; full_name: string };
type Submission = { answers: Record<string, { level_id: number }>; comments?: string | null; reopened_at?: string | null };

export default function EvaluationForm({ student, template, submission, supervisorType }: { student: Student; template: Template; submission: Submission | null; supervisorType: string }) {
    const initial = Object.fromEntries(Object.entries(submission?.answers ?? {}).map(([key, answer]) => [key, answer.level_id]));
    const { data, setData, post, processing, errors } = useForm<{ answers: Record<string, number>; comments: string }>({ answers: initial, comments: submission?.comments ?? '' });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const routeName = supervisorType === 'Academic Supervisor'
            ? 'academic-supervisor.student.evaluate.store'
            : 'industry-supervisor.student.evaluate.store';
        post(route(routeName, student.student_id));
    };

    return <AuthenticatedLayout>
        <Head title={`Evaluation · ${student.full_name}`} />
        <main className="mx-auto w-full max-w-6xl space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <BackButton href={route(supervisorType === 'Academic Supervisor' ? 'academic-supervisor.student.show' : 'industry-supervisor.student.show', student.student_id)}>Back to Student Details</BackButton>
            <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600"><ClipboardCheck size={23} /></div><div className="min-w-0"><p className="text-sm font-semibold text-indigo-600">{roleLabel(supervisorType)}</p><h1 className="mt-1 font-sato text-2xl font-bold text-slate-900 sm:text-3xl">{roleLabel(template.name)}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{student.full_name}{student.pb_student_code ? ` · ${student.pb_student_code}` : ''}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">Version {template.version}</span><span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">{template.component_weight}% of final score</span></div></div></div></header>
            {submission?.reopened_at && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Superadmin reopened this evaluation. Correct the grading and resubmit it. The original submitted result is retained in history.</p>}
            <form onSubmit={submit} className="space-y-6">
                <p className="text-sm leading-6 text-slate-500">Open a criterion and choose the grading level that best matches the student’s performance.</p>
                {template.sections.map((section, index) => <GradingSection key={section.id} section={section} index={index} answers={data.answers} onSelect={(criterionId, levelId) => setData('answers', { ...data.answers, [criterionId]: levelId })} errors={errors as Record<string, string>} />)}
                {errors.answers && <p role="alert" className="text-sm text-rose-600">{errors.answers}</p>}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><label htmlFor="evaluation-comments" className="block text-sm font-semibold text-slate-800">Additional comments <span className="font-normal text-slate-400">(optional)</span></label><textarea id="evaluation-comments" rows={4} value={data.comments} onChange={(event) => setData('comments', event.target.value)} className={`${evaluationInputClass} mt-3 resize-y`} placeholder="Add feedback for the student" />{errors.comments && <p className="mt-2 text-sm text-rose-600">{errors.comments}</p>}</section>
                <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm"><button type="submit" disabled={processing} className="w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto">{processing ? 'Submitting…' : submission ? 'Resubmit corrected evaluation' : 'Submit evaluation'}</button></div>
            </form>
        </main>
    </AuthenticatedLayout>;
}
