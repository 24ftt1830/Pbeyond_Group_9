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
    const sectionPanelId = `${id}-section`;
    const sectionToggleId = `${id}-toggle`;
    const [sectionExpanded, setSectionExpanded] = useState(index === 0);
    const [openCriterion, setOpenCriterion] = useState<number | null>(() => section.criteria.find((criterion) => !levelsFor(criterion).some((level) => level.id === Number(answers[criterion.id])))?.id ?? null);
    const graded = section.criteria.filter((criterion) => levelsFor(criterion).some((level) => level.id === Number(answers[criterion.id]))).length;
    const complete = graded === section.criteria.length;
    const sectionHasErrors = section.criteria.some((criterion) => errors[`answers.${criterion.id}`]);

    useEffect(() => {
        const firstError = section.criteria.find((criterion) => errors[`answers.${criterion.id}`]);
        if (firstError) {
            setSectionExpanded(true);
            setOpenCriterion(firstError.id);
        }
    }, [errors, section.criteria]);

    return <section className={`rounded-xl border bg-white shadow-sm ${sectionHasErrors ? 'border-rose-300' : 'border-blue-200'}`}>
        <header className={`flex flex-wrap items-center gap-2 bg-blue-50 px-4 py-4 sm:px-5 ${sectionExpanded ? 'rounded-t-xl border-b border-blue-200' : 'rounded-xl'}`}>
            <h2 className="min-w-0 basis-full sm:flex-1 sm:basis-0">
                <button
                    id={sectionToggleId}
                    type="button"
                    aria-expanded={sectionExpanded}
                    aria-controls={sectionPanelId}
                    onClick={() => setSectionExpanded((current) => !current)}
                    className="flex w-full min-w-0 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                    <span className="ui-badge inline-flex shrink-0 items-center border border-blue-200 bg-white text-[11px] font-semibold uppercase tracking-wide tabular-nums text-primary">Section {String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 break-words text-base font-semibold text-slate-900">{section.title}</span>
                    <ChevronDown size={17} className={`shrink-0 text-primary transition-transform ${sectionExpanded ? 'rotate-180' : ''}`} />
                </button>
            </h2>
            <div className="ml-auto flex flex-wrap items-center gap-2">
                <span className="ui-badge border border-blue-200 bg-white text-xs font-semibold tabular-nums text-primary">{section.weight}%{weightLabel ? ` ${weightLabel}` : ''}</span>
                <span className={`ui-badge inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${complete ? 'ui-badge-success' : 'border-blue-200 bg-white text-slate-600'}`}>
                    {complete && <CheckCircle2 size={14} />}{graded} / {section.criteria.length} graded
                </span>
            </div>
        </header>

        {sectionExpanded && <div id={sectionPanelId} role="region" aria-labelledby={sectionToggleId} className="px-4 pb-5 pt-4 sm:px-5">
            {section.description && (section.description.length > 220
                ? <details className="mb-4 text-sm text-slate-500"><summary className="cursor-pointer font-medium">Section description</summary><p className="mt-1 whitespace-pre-line leading-6">{section.description}</p></details>
                : <p className="mb-4 whitespace-pre-line text-sm leading-6 text-slate-500">{section.description}</p>)}
            <div className="mb-4 h-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${section.title} grading progress`} aria-valuemin={0} aria-valuemax={section.criteria.length} aria-valuenow={graded}>
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${section.criteria.length ? (graded / section.criteria.length) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-semibold text-slate-800">Assessment criteria</h3>
                <span className="text-xs tabular-nums text-slate-500">{section.criteria.length} {section.criteria.length === 1 ? 'criterion' : 'criteria'}</span>
            </div>
            <div className="mt-3 space-y-3">
            {section.criteria.map((criterion, ci) => {
                const levels = levelsFor(criterion);
                const selected = levels.find((level) => level.id === Number(answers[criterion.id]));
                const error = errors[`answers.${criterion.id}`];
                const expanded = openCriterion === criterion.id;
                const panelId = `${id}-${criterion.id}`;
                const summary = <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-semibold tabular-nums text-primary">{String(ci + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-semibold text-slate-900">{criterion.title}</span>
                        <span className={`mt-1 flex items-center gap-1.5 text-xs ${error ? 'text-rose-600' : selected ? 'text-primary' : 'text-slate-500'}`}>
                            {selected && !error && <CheckCircle2 size={13} className="shrink-0" />}
                            <span>{error ? 'Select a grading level' : selected ? `${selected.title} · ${selected.points} pts` : readOnly ? 'No grade recorded' : 'Choose a grading level'}</span>
                        </span>
                    </span>
                </>;

                return <article key={criterion.id} className={`overflow-hidden rounded-lg border bg-white transition-colors ${error ? 'border-rose-300' : expanded && !readOnly ? 'border-blue-300' : 'border-blue-100'}`}>
                    {readOnly
                        ? <div className="flex items-center gap-3 bg-blue-50/40 px-3 py-4">{summary}</div>
                        : <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpenCriterion(expanded ? null : criterion.id)} className={`flex w-full items-center gap-3 px-3 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/25 ${expanded ? 'bg-blue-50' : 'bg-blue-50/40 hover:bg-blue-50'}`}>
                            {summary}
                            <span className="hidden text-xs font-medium text-primary sm:block">{expanded ? 'Close' : selected ? 'Change rating' : 'Rate'}</span>
                            <ChevronDown size={16} className={`shrink-0 text-primary transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>}
                    {readOnly ? selected && <div className="border-t border-blue-100 px-3 py-4 sm:pl-16 sm:pr-4"><p className="text-sm font-medium text-slate-700">{selected.title}<span className="ml-2 text-xs font-medium text-slate-500">{selected.points} pts</span></p>{selected.description && <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-500">{selected.description}</p>}</div> : expanded && <div id={panelId} className="space-y-3 border-t border-blue-100 bg-white px-3 py-4 sm:pl-16 sm:pr-4">
                        {criterion.description && <p className="whitespace-pre-line text-sm leading-6 text-slate-500">{criterion.description}</p>}
                        <p className="text-sm font-semibold text-slate-800">Grading levels</p>
                        <div className="space-y-2" role="group" aria-label={`Grading levels for ${criterion.title}`}>
                            {levels.map((level) => {
                                const chosen = selected?.id === level.id;
                                return <button key={level.id} type="button" aria-pressed={chosen} onClick={() => onSelect(criterion.id, level.id)} className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/25 ${chosen ? 'border-blue-300 bg-primary/10' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'}`}>
                                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${chosen ? 'border-primary bg-primary text-white' : 'border-slate-300 text-transparent'}`}>{chosen && <Check size={12} />}</span>
                                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{level.title}</span>{level.description && <span className="mt-0.5 block whitespace-pre-line text-sm leading-5 text-slate-500">{level.description}</span>}</span>
                                    <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${chosen ? 'bg-white text-primary' : 'bg-slate-100 text-slate-500'}`}>{level.points} pts</span>
                                </button>;
                            })}
                        </div>
                        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
                    </div>}
                </article>;
            })}
            </div>
        </div>}
    </section>;
}
