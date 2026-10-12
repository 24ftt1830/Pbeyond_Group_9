import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';
import BackButton from '@/Components/BackButton';
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
        <main className="mx-auto w-full max-w-5xl space-y-6 p-5 md:p-8">
            <BackButton href={route(supervisorType === 'Academic Supervisor' ? 'academic-supervisor.student.show' : 'industry-supervisor.student.show', student.student_id)}>Back to Student Details</BackButton>
            <header className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-center gap-4"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700"><ClipboardCheck /></div><div><p className="text-sm font-semibold text-indigo-700">{supervisorType} · Version {template.version} · {template.component_weight}% of final score</p><h1 className="text-2xl font-bold text-slate-900">{template.name}</h1><p className="mt-1 text-sm text-slate-500">{student.full_name} · {student.pb_student_code}</p></div></div></header>
            {submission?.reopened_at && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Superadmin reopened this evaluation. Correct the grading and resubmit it. The original submitted result is retained in history.</p>}
            <form onSubmit={submit} className="space-y-5">
                {template.sections.map((section) => <section key={section.id} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{section.title}</h2>{section.description && <p className="mt-1 text-sm text-slate-500">{section.description}</p>}</div><span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{section.weight}%</span></div>
                    {section.criteria.map((criterion) => {
                        const levels = criterion.rating_levels ?? criterion.ratingLevels ?? [];
                        return <fieldset key={criterion.id} className="border-t pt-4">
                            <legend className="font-semibold text-slate-800">{criterion.title}</legend>
                            {criterion.description && <p className="mb-3 mt-1 text-sm text-slate-500">{criterion.description}</p>}
                            <div className="grid gap-3 md:grid-cols-2" role="group" aria-label={`Grading levels for ${criterion.title}`}>
                                {levels.map((level) => {
                                    const selected = Number(data.answers[criterion.id]) === level.id;

                                    return <button
                                        key={level.id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setData('answers', { ...data.answers, [criterion.id]: level.id })}
                                        className={`cursor-pointer rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${selected ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'bg-white hover:border-slate-300'}`}
                                    >
                                        <span className="flex items-center justify-between gap-3"><span className="font-semibold">{level.title}</span><span className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-600">{level.points} pts</span></span>{level.description && <span className="mt-2 block text-sm leading-5 text-slate-600">{level.description}</span>}
                                    </button>;
                                })}
                            </div>
                            {errors[`answers.${criterion.id}`] && <p className="mt-2 text-sm text-red-600">{errors[`answers.${criterion.id}`]}</p>}
                        </fieldset>;
                    })}
                </section>)}
                {errors.answers && <p className="text-sm text-red-600">{errors.answers}</p>}
                <section className="rounded-2xl border bg-white p-6 shadow-sm"><label className="mb-2 block font-semibold">Additional comments</label><textarea rows={4} value={data.comments} onChange={(event) => setData('comments', event.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Optional feedback" />{errors.comments && <p className="mt-1 text-sm text-red-600">{errors.comments}</p>}</section>
                <div className="flex justify-end"><button disabled={processing} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{processing ? 'Submitting…' : submission ? 'Resubmit corrected evaluation' : 'Submit evaluation'}</button></div>
            </form>
        </main>
    </AuthenticatedLayout>;
}
