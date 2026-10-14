import { useEffect, useId, useState } from 'react';
import { Check, CheckCircle2, ChevronDown } from 'lucide-react';

type Level = { id: number; title: string; description?: string | null; points: number };
type Criterion = { id: number; title: string; description?: string | null; rating_levels?: Level[]; ratingLevels?: Level[] };
export type GradingRubricSection = { id: number; title: string; description?: string | null; weight: number | string; criteria: Criterion[] };

type Props = {
    section: GradingRubricSection;
    index: number;
    answers: Record<string, number | string>;
    onSelect: (criterionId: number, levelId: number) => void;
    errors?: Record<string, string>;
    readOnly?: boolean;
    weightLabel?: string;
};

const levelsFor = (criterion: Criterion) => criterion.rating_levels ?? criterion.ratingLevels ?? [];

export default function GradingSection({ section, index, answers, onSelect, errors = {}, readOnly = false, weightLabel }: Props) {
    const id = useId();
    const [openCriterion, setOpenCriterion] = useState<number | null>(() => section.criteria.find((criterion) => !levelsFor(criterion).some((level) => level.id === Number(answers[criterion.id])))?.id ?? null);
    const graded = section.criteria.filter((criterion) => levelsFor(criterion).some((level) => level.id === Number(answers[criterion.id]))).length;

    useEffect(() => {
        const firstError = section.criteria.find((criterion) => errors[`answers.${criterion.id}`]);
        if (firstError) setOpenCriterion(firstError.id);
    }, [errors, section.criteria]);

    return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Section {String(index + 1).padStart(2, '0')}</p><h2 className="mt-1 break-words text-lg font-bold text-slate-900">{section.title}</h2></div>
                <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs font-medium tabular-nums text-slate-500">{section.weight}%{weightLabel ? ` ${weightLabel}` : ''}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${graded === section.criteria.length ? 'text-emerald-700' : 'text-slate-500'}`}>{graded === section.criteria.length && <CheckCircle2 size={14} />}{graded} / {section.criteria.length} graded</span>
                </div>
            </div>
            {section.description && (section.description.length > 220 ? <details className="mt-2 text-sm text-slate-500"><summary className="cursor-pointer font-medium">Section description</summary><p className="mt-1 whitespace-pre-line leading-6">{section.description}</p></details> : <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">{section.description}</p>)}
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${section.title} grading progress`} aria-valuemin={0} aria-valuemax={section.criteria.length} aria-valuenow={graded}><div className="h-full rounded-full bg-indigo-500 transition-[width]" style={{ width: `${section.criteria.length ? (graded / section.criteria.length) * 100 : 0}%` }} /></div>
        </header>

        <div>
            {section.criteria.map((criterion, ci) => {
                const levels = levelsFor(criterion);
                const selected = levels.find((level) => level.id === Number(answers[criterion.id]));
                const error = errors[`answers.${criterion.id}`];
                const expanded = openCriterion === criterion.id;
                const panelId = `${id}-${criterion.id}`;
                const summary = <>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-semibold tabular-nums ${selected ? 'text-indigo-600' : 'text-slate-400'}`}>{selected ? <Check size={16} /> : String(ci + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1"><span className="block break-words text-sm font-medium text-slate-900">{criterion.title}</span><span className={`mt-0.5 block text-xs ${error ? 'text-rose-600' : selected ? 'text-indigo-600' : 'text-slate-500'}`}>{error ? 'Select a grading level' : selected ? `${selected.title} · ${selected.points} pts` : readOnly ? 'No grade recorded' : 'Choose a grading level'}</span></span>
                </>;

                return <article key={criterion.id} className="border-t border-slate-100">
                    {readOnly ? <div className="flex items-center gap-3 px-4 py-3 sm:px-5">{summary}</div> : <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpenCriterion(expanded ? null : criterion.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:px-5 ${expanded ? 'bg-slate-50' : 'hover:bg-slate-50/70'}`}>{summary}<ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>}
                    {readOnly ? selected && <div className="border-t border-slate-100 px-4 py-3 pl-14 sm:px-5 sm:pl-16"><p className="text-sm font-medium text-slate-700">{selected.title}<span className="ml-2 text-xs font-medium text-slate-500">{selected.points} pts</span></p>{selected.description && <p className="mt-1 text-sm leading-6 text-slate-500">{selected.description}</p>}</div> : expanded && <div id={panelId} className="space-y-3 bg-white px-4 pb-4 pl-14 sm:px-5 sm:pl-16">
                        {criterion.description && <p className="pb-1 text-sm leading-6 text-slate-500">{criterion.description}</p>}
                        <div className="divide-y divide-slate-100 border-y border-slate-100" role="group" aria-label={`Grading levels for ${criterion.title}`}>
                            {levels.map((level) => {
                                const chosen = selected?.id === level.id;
                                return <button key={level.id} type="button" aria-pressed={chosen} onClick={() => onSelect(criterion.id, level.id)} className={`flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${chosen ? 'border-l-indigo-600 bg-indigo-50/60' : 'border-l-transparent hover:bg-slate-50'}`}>
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${chosen ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-transparent'}`}>{chosen && <Check size={12} />}</span>
                                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{level.title}</span>{level.description && <span className="mt-0.5 block text-sm leading-5 text-slate-500">{level.description}</span>}</span>
                                    <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">{level.points} pts</span>
                                </button>;
                            })}
                        </div>
                        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
                    </div>}
                </article>;
            })}
        </div>
    </section>;
}
