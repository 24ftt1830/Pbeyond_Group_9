import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

export type RubricLevel = { title: string; description?: string | null; points: number | string | null };
export type RubricCriterion = { title: string; description?: string | null; levels: RubricLevel[] };
export type RubricSection = { title: string; description?: string | null; weight: number | string | null; criteria: RubricCriterion[] };

export const emptyCriterion = (): RubricCriterion => ({
    title: '',
    description: '',
    levels: [
        { title: '', description: '', points: '' },
        { title: '', description: '', points: '' },
    ],
});

export const emptySection = (): RubricSection => ({
    title: '',
    description: '',
    weight: '',
    criteria: [emptyCriterion()],
});

export const evaluationInputClass = 'block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15';
const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';
const iconButtonClass = 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-30';

type Props = {
    sections: RubricSection[];
    onChange: (sections: RubricSection[]) => void;
    errors?: Record<string, string>;
    fixedSectionWeight?: number;
};

export default function RubricEditor({ sections, onChange, errors = {}, fixedSectionWeight }: Props) {
    const id = useId();
    const [openSections, setOpenSections] = useState<Set<number>>(() => new Set([0]));
    const [openCriteria, setOpenCriteria] = useState<Record<number, number | null>>({});
    const criterionMenus = useRef(new Map<string, HTMLDetailsElement>());
    const canManageSections = fixedSectionWeight === undefined;

    useEffect(() => {
        const firstErrors: Record<number, number> = {};
        const sectionErrors = new Set<number>();
        Object.keys(errors).forEach((key) => {
            const match = key.match(/^sections\.(\d+)(?:\.criteria\.(\d+))?/);
            if (!match) return;
            const sectionIndex = Number(match[1]);
            sectionErrors.add(sectionIndex);
            if (match[2] !== undefined && firstErrors[sectionIndex] === undefined) firstErrors[sectionIndex] = Number(match[2]);
        });
        if (sectionErrors.size) {
            setOpenSections((current) => new Set([...current, ...sectionErrors]));
            setOpenCriteria((current) => ({ ...current, ...firstErrors }));
        }
    }, [errors]);

    const fieldError = (path: string) => errors[path];
    const hasErrors = (path: string) => Object.keys(errors).some((key) => key === path || key.startsWith(`${path}.`));
    const fieldId = (path: string) => `${id}-${path.replace(/\./g, '-')}`;

    function updateSection(si: number, patch: Partial<RubricSection>) {
        onChange(sections.map((section, index) => index === si ? { ...section, ...patch } : section));
    }

    function updateCriterion(si: number, ci: number, patch: Partial<RubricCriterion>) {
        updateSection(si, { criteria: sections[si].criteria.map((criterion, index) => index === ci ? { ...criterion, ...patch } : criterion) });
    }

    function updateLevel(si: number, ci: number, li: number, patch: Partial<RubricLevel>) {
        updateCriterion(si, ci, { levels: sections[si].criteria[ci].levels.map((level, index) => index === li ? { ...level, ...patch } : level) });
    }

    function moveSection(si: number, offset: number) {
        const target = si + offset;
        if (target < 0 || target >= sections.length) return;
        const next = [...sections];
        [next[si], next[target]] = [next[target], next[si]];
        onChange(next);
        const swapped = (index: number) => index === si ? target : index === target ? si : index;
        setOpenSections((current) => new Set([...current].map(swapped)));
        setOpenCriteria((current) => Object.fromEntries(Object.entries(current).map(([index, value]) => [swapped(Number(index)), value])));
    }

    function removeSection(si: number) {
        if (sections.length <= 1) return;
        onChange(sections.filter((_, index) => index !== si));
        setOpenSections((current) => new Set([...current].filter((index) => index !== si).map((index) => index > si ? index - 1 : index)));
        setOpenCriteria((current) => Object.fromEntries(Object.entries(current).filter(([index]) => Number(index) !== si).map(([index, value]) => [Number(index) > si ? Number(index) - 1 : Number(index), value])));
    }

    function moveCriterion(si: number, ci: number, offset: number) {
        const criteria = [...sections[si].criteria];
        const target = ci + offset;
        if (target < 0 || target >= criteria.length) return;
        [criteria[ci], criteria[target]] = [criteria[target], criteria[ci]];
        updateSection(si, { criteria });
        setOpenCriteria((current) => ({ ...current, [si]: current[si] === ci ? target : current[si] === target ? ci : current[si] ?? null }));
    }

    function removeCriterion(si: number, ci: number) {
        if (sections[si].criteria.length <= 1) return;
        updateSection(si, { criteria: sections[si].criteria.filter((_, index) => index !== ci) });
        setOpenCriteria((current) => {
            const open = current[si];
            return { ...current, [si]: open === ci ? null : open !== undefined && open !== null && open > ci ? open - 1 : open ?? null };
        });
    }

    function addCriterion(si: number) {
        const ci = sections[si].criteria.length;
        updateSection(si, { criteria: [...sections[si].criteria, emptyCriterion()] });
        setOpenCriteria((current) => ({ ...current, [si]: ci }));
    }

    function toggleSection(si: number) {
        setOpenSections((current) => {
            const next = new Set(current);
            if (next.has(si)) next.delete(si);
            else next.add(si);
            return next;
        });
    }

    return <div className="space-y-4">
        {sections.map((section, si) => {
            const sectionPath = `sections.${si}`;
            const expanded = openSections.has(si);
            const panelId = `${id}-section-${si}`;
            return <section key={si} className={`rounded-xl border bg-white shadow-sm ${hasErrors(sectionPath) ? 'border-rose-200' : 'border-slate-200'}`}>
                <div className="flex flex-wrap items-center gap-2 rounded-t-xl border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
                    <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => toggleSection(si)} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                        <span className="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide tabular-nums text-slate-500">Section {String(si + 1).padStart(2, '0')}</span>
                        <span className="min-w-0 flex-1 break-words text-sm font-semibold text-slate-900">{section.title || 'Untitled section'}</span>
                        <ChevronDown size={17} className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    <span className="ml-auto rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-slate-600">{fixedSectionWeight !== undefined ? `${fixedSectionWeight}% report mark` : `${Number(section.weight) || 0}%`}</span>
                    {canManageSections && <ActionMenu label={`More actions for section ${si + 1}`} actions={[
                        { label: 'Move up', icon: <ArrowUp size={15} />, disabled: si === 0, run: () => moveSection(si, -1) },
                        { label: 'Move down', icon: <ArrowDown size={15} />, disabled: si === sections.length - 1, run: () => moveSection(si, 1) },
                        { label: 'Delete section', icon: <Trash2 size={15} />, disabled: sections.length <= 1, destructive: true, run: () => removeSection(si) },
                    ]} />}
                </div>

                {expanded && <div id={panelId} className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">
                    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-[minmax(0,1fr)_150px]">
                        <Field label="Section name" id={fieldId(`${sectionPath}.title`)} error={fieldError(`${sectionPath}.title`)}>
                            <input id={fieldId(`${sectionPath}.title`)} value={section.title} onChange={(event) => updateSection(si, { title: event.target.value, ...(fixedSectionWeight !== undefined ? { weight: fixedSectionWeight } : {}) })} placeholder="Enter section name" className={evaluationInputClass} aria-invalid={!!fieldError(`${sectionPath}.title`)} />
                        </Field>
                        {canManageSections && <Field label="Weight" id={fieldId(`${sectionPath}.weight`)} error={fieldError(`${sectionPath}.weight`)}>
                            <div className="relative"><input id={fieldId(`${sectionPath}.weight`)} type="number" min="0" max="100" step="0.01" value={section.weight ?? ''} onChange={(event) => updateSection(si, { weight: event.target.value })} className={`${evaluationInputClass} pr-8`} aria-invalid={!!fieldError(`${sectionPath}.weight`)} /><span className="pointer-events-none absolute right-3 top-2.5 text-sm text-slate-500">%</span></div>
                        </Field>}
                        <div className={canManageSections ? 'sm:col-span-2' : ''}>
                            <Field label="Section description" optional id={fieldId(`${sectionPath}.description`)} error={fieldError(`${sectionPath}.description`)}>
                                <textarea id={fieldId(`${sectionPath}.description`)} value={section.description ?? ''} onChange={(event) => updateSection(si, { description: event.target.value })} placeholder="Describe what this section covers" rows={2} className={`${evaluationInputClass} resize-y`} />
                            </Field>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-semibold text-slate-800">Assessment criteria</h3>
                            <span className="text-xs tabular-nums text-slate-500">{section.criteria.length} {section.criteria.length === 1 ? 'criterion' : 'criteria'}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                        {section.criteria.map((criterion, ci) => {
                            const path = `${sectionPath}.criteria.${ci}`;
                            const criterionExpanded = openCriteria[si] === ci;
                            const criterionPanel = `${id}-criterion-${si}-${ci}`;
                            const maxPoints = Math.max(0, ...criterion.levels.map((level) => Number(level.points) || 0));
                            return <article key={ci} className={`relative rounded-lg border bg-white ${hasErrors(path) ? 'border-rose-200' : 'border-slate-200'}`}>
                                <div className={`flex flex-wrap items-center gap-2 rounded-t-lg px-3 py-2 ${criterionExpanded ? 'bg-slate-50' : 'rounded-b-lg bg-white'}`}>
                                    <button type="button" aria-expanded={criterionExpanded} aria-controls={criterionPanel} onClick={() => {
                                        if (criterionExpanded) {
                                            const menu = criterionMenus.current.get(`${si}-${ci}`);
                                            if (menu) menu.open = false;
                                        }
                                        setOpenCriteria((current) => ({ ...current, [si]: criterionExpanded ? null : ci }));
                                    }} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                                        <span className="w-7 shrink-0 text-xs font-semibold tabular-nums text-slate-400">{String(ci + 1).padStart(2, '0')}</span>
                                        <span className="min-w-0 flex-1"><span className="block break-words text-sm font-medium text-slate-900">{criterion.title || 'Untitled criterion'}</span><span className={`mt-0.5 block text-xs ${hasErrors(path) ? 'text-rose-600' : 'text-slate-500'}`}>{hasErrors(path) ? 'Review highlighted fields' : `${criterion.levels.length} levels · ${maxPoints} max points`}</span></span>
                                        <span className="hidden text-xs font-medium text-indigo-700 sm:block">{criterionExpanded ? 'Close' : 'Edit'}</span>
                                        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${criterionExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    <ActionMenu label={`More actions for criterion ${ci + 1}`} detailsRef={(node) => {
                                        const key = `${si}-${ci}`;
                                        if (node) criterionMenus.current.set(key, node);
                                        else criterionMenus.current.delete(key);
                                    }} actions={[
                                        { label: 'Move up', icon: <ArrowUp size={15} />, disabled: ci === 0, run: () => moveCriterion(si, ci, -1) },
                                        { label: 'Move down', icon: <ArrowDown size={15} />, disabled: ci === section.criteria.length - 1, run: () => moveCriterion(si, ci, 1) },
                                        { label: 'Delete criterion', icon: <Trash2 size={15} />, disabled: section.criteria.length <= 1, destructive: true, run: () => removeCriterion(si, ci) },
                                    ]} />
                                </div>
                                {criterionExpanded && <div id={criterionPanel} className="space-y-4 rounded-b-lg border-t border-slate-200 bg-slate-50/50 px-3 pb-4 pt-4 sm:pl-[3.25rem] sm:pr-4">
                                    <Field label="Criterion name" id={fieldId(`${path}.title`)} error={fieldError(`${path}.title`)}>
                                        <input id={fieldId(`${path}.title`)} value={criterion.title} onChange={(event) => updateCriterion(si, ci, { title: event.target.value })} placeholder="Enter criterion name" className={evaluationInputClass} aria-invalid={!!fieldError(`${path}.title`)} />
                                    </Field>
                                    <Field label="Criterion description" optional id={fieldId(`${path}.description`)} error={fieldError(`${path}.description`)}>
                                        <textarea id={fieldId(`${path}.description`)} value={criterion.description ?? ''} onChange={(event) => updateCriterion(si, ci, { description: event.target.value })} placeholder="Describe what this criterion assesses" rows={2} className={`${evaluationInputClass} resize-y`} />
                                    </Field>
                                    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                            <div><h4 className="text-sm font-medium text-slate-800">Grading levels</h4><p className="mt-0.5 text-xs text-slate-500">Set each level’s name, points and description.</p></div>
                                            <button type="button" onClick={() => updateCriterion(si, ci, { levels: [...criterion.levels, { title: '', description: '', points: '' }] })} className={secondaryButtonClass}><Plus size={15} /> Add level</button>
                                        </div>
                                        <div className="divide-y divide-slate-200 border-y border-slate-200">
                                        {criterion.levels.map((level, li) => {
                                            const levelPath = `${path}.levels.${li}`;
                                            return <div key={li} className="py-3 first:pt-3 last:pb-3">
                                                <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Level {String(li + 1).padStart(2, '0')}</span><button type="button" aria-label={`Delete grading level ${li + 1}`} title={`Delete grading level ${li + 1}`} disabled={criterion.levels.length <= 1} onClick={() => updateCriterion(si, ci, { levels: criterion.levels.filter((_, index) => index !== li) })} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={15} /></button></div>
                                                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,1fr)_100px]">
                                                    <Field label="Level name" id={fieldId(`${levelPath}.title`)} error={fieldError(`${levelPath}.title`)}><input id={fieldId(`${levelPath}.title`)} value={level.title} onChange={(event) => updateLevel(si, ci, li, { title: event.target.value })} placeholder="Enter level name" className={evaluationInputClass} aria-invalid={!!fieldError(`${levelPath}.title`)} /></Field>
                                                    <Field label="Points" id={fieldId(`${levelPath}.points`)} error={fieldError(`${levelPath}.points`)}><input id={fieldId(`${levelPath}.points`)} type="number" min="0" value={level.points ?? ''} onChange={(event) => updateLevel(si, ci, li, { points: event.target.value })} className={evaluationInputClass} aria-invalid={!!fieldError(`${levelPath}.points`)} /></Field>
                                                    <div className="sm:col-span-2"><Field label="Performance description" id={fieldId(`${levelPath}.description`)} error={fieldError(`${levelPath}.description`)}><textarea id={fieldId(`${levelPath}.description`)} value={level.description ?? ''} onChange={(event) => updateLevel(si, ci, li, { description: event.target.value })} placeholder="Describe performance at this level" rows={2} className={`${evaluationInputClass} resize-y`} aria-invalid={!!fieldError(`${levelPath}.description`)} /></Field></div>
                                                </div>
                                            </div>;
                                        })}
                                        </div>
                                        {fieldError(`${path}.levels`) && <p className="pt-2 text-sm text-rose-600">{fieldError(`${path}.levels`)}</p>}
                                    </div>
                                </div>}
                            </article>;
                        })}
                        </div>
                        {fieldError(`${sectionPath}.criteria`) && <p className="py-2 text-sm text-rose-600">{fieldError(`${sectionPath}.criteria`)}</p>}
                        <button type="button" onClick={() => addCriterion(si)} className={`${secondaryButtonClass} -ml-3 mt-1`}><Plus size={16} /> Add criterion</button>
                    </div>
                </div>}
            </section>;
        })}
        {canManageSections && <button type="button" onClick={() => {
            const si = sections.length;
            onChange([...sections, emptySection()]);
            setOpenSections((current) => new Set([...current, si]));
            setOpenCriteria((current) => ({ ...current, [si]: 0 }));
        }} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Plus size={16} /> Add section</button>}
    </div>;
}

function Field({ label, optional, id, error, children }: { label: string; optional?: boolean; id: string; error?: string; children: ReactNode }) {
    return <div className="min-w-0 space-y-1.5"><label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}{optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}</label>{children}{error && <p className="text-sm leading-5 text-rose-600">{error}</p>}</div>;
}

function ActionMenu({ label, actions, detailsRef }: { label: string; detailsRef?: (node: HTMLDetailsElement | null) => void; actions: { label: string; icon: ReactNode; disabled?: boolean; destructive?: boolean; run: () => void }[] }) {
    const menu = useRef<{ element: HTMLDetailsElement | null }>({ element: null });
    const [openAbove, setOpenAbove] = useState(false);
    const menuHeight = actions.length * 36 + 8;
    function positionMenu() {
        const trigger = menu.current.element;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenAbove(spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow);
    }

    return <details ref={(node) => { menu.current.element = node; detailsRef?.(node); }} onToggle={(event) => { if (event.currentTarget.open) positionMenu(); }} className="relative shrink-0">
        <summary aria-label={label} title={label} onClick={() => { if (!menu.current.element?.open) positionMenu(); }} className={`${iconButtonClass} list-none cursor-pointer [&::-webkit-details-marker]:hidden`}><MoreHorizontal size={18} /></summary>
        <div className={`absolute right-0 z-20 max-h-[calc(100vh-1rem)] min-w-40 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10 ${openAbove ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
            {actions.map((action) => <button key={action.label} type="button" disabled={action.disabled} onClick={() => { action.run(); if (menu.current.element) menu.current.element.open = false; }} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${action.destructive ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700'}`}>
                {action.icon}{action.label}
            </button>)}
        </div>
    </details>;
}
