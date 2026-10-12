import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ClipboardCheck, Plus, Trash2, Save, Layers3, ArrowUp, ArrowDown, CheckCircle2, LoaderCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';

type Level = { title: string; description?: string | null; points: number | string | null };
type Criterion = { title: string; description?: string | null; levels: Level[] };
type Section = { title: string; description?: string | null; weight: number | string | null; criteria: Criterion[] };
type Template = { id: number; name: string; supervisor_type: string; component_weight: number | string; version: number; is_active: boolean; sections: Section[] };
type FormData = { supervisor_type: string; component_weight: number | string | null; is_active: boolean; sections: Section[] };
type ComponentWeights = { academic_supervisor: number | string; industry_supervisor: number | string; student_written_report: number | string };
type FinalReportSummary = { id: number; title: string; submitted_at?: string | null; academic_review_status: string; industry_confirmation_status: string; academic_completion_status: string; report_score: number | string | null; completion_status: string; overall_score: number | null; student?: { student_id: number; full_name: string; pb_student_code: string } | null };

const blankCriterion = (): Criterion => ({ title: '', description: '', levels: [{ title: '', description: '', points: '' }, { title: '', description: '', points: '' }] });
const blankSection = (): Section => ({ title: '', description: '', weight: '', criteria: [blankCriterion()] });
const blankData = (type = 'Academic Supervisor'): FormData => ({ supervisor_type: type, component_weight: '', is_active: false, sections: [blankSection()] });
const latestTemplate = (templates: Template[], type: string) => templates.filter((item) => item.supervisor_type === type).sort((a, b) => b.version - a.version)[0];
const reportRubricSections = (template?: Template | null): Section[] => {
    if (!template?.sections?.length) return [{ ...blankSection(), weight: 100 }];
    const sections = template.sections.map((section: any) => ({
        ...section,
        criteria: (section.criteria ?? []).map((criterion: any) => ({
            ...criterion,
            levels: criterion.rating_levels ?? criterion.ratingLevels ?? criterion.levels ?? [],
        })),
    }));
    if (sections.length === 1) return [{ ...sections[0], weight: 100 }];

    return [{
        title: 'Written Report Assessment',
        description: sections.map((section) => [section.title, section.description].filter(Boolean).join(': ')).join('\n'),
        weight: 100,
        criteria: sections.flatMap((section) => section.criteria),
    }];
};
function savedTemplateIssues(template: Template | undefined, componentAllocation: number): string[] {
    if (!template) return ['Evaluation template is missing. Save a complete template before activation.'];
    const sections = template.sections ?? [];
    if (!sections.length) return ['Template has no sections. Add at least one section.'];
    const sectionTotal = sections.reduce((sum, section) => sum + (Number(section.weight) || 0), 0);
    const issues: string[] = [];
    const hasInvalidWeight = sections.some((section) => section.weight === null || section.weight === '' || !Number.isFinite(Number(section.weight)) || Number(section.weight) < 0);
    if (hasInvalidWeight || Math.abs(sectionTotal - componentAllocation) > 0.001) issues.push(`Section weights total ${formatPercent(sectionTotal)}%; they must equal the component allocation of ${formatPercent(componentAllocation)}%.`);
    const hasIncompleteFields = sections.some((section) => !section.title?.trim() || section.weight === null || section.weight === '' || !section.criteria?.length || section.criteria.some((criterion: any) => {
        const levels = criterion.rating_levels ?? criterion.ratingLevels ?? criterion.levels ?? [];
        return !criterion.title?.trim() || !levels.length || levels.some((level: Level) => !level.title?.trim() || !level.description?.trim() || level.points === null || level.points === '') || !levels.some((level: Level) => Number(level.points) > 0);
    }));
    if (hasIncompleteFields) issues.push('Complete each section, criterion, and rating level.');
    return issues;
}
const formatPercent = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
const savedWrittenReportIssues = (template?: Template): string[] => {
    if (template?.sections?.length !== 1) {
        return [...savedTemplateIssues(template, 100), 'Written Report rubric must contain exactly one section. Save its criteria in a single section before activation.'];
    }
    return savedTemplateIssues(template, 100);
};
const activationWeightWarning = (total: number) => `Cannot activate evaluation. Overall component weights must total exactly 100%. Current total: ${formatPercent(total)}%.`;
const draftWeightWarning = (total: number) => total < 100
    ? `Overall evaluation component weights are below 100% (${formatPercent(total)}%). The draft has been saved, but it cannot be activated until the total equals 100%.`
    : `Overall evaluation component weights exceed 100% (${formatPercent(total)}%). The draft has been saved, but it cannot be activated until the total equals 100%.`;

export default function Evaluations({ templates, writtenReportTemplate, reports, studentWrittenReportWeight, componentWeights: initialComponentWeights }: { templates: Template[]; writtenReportTemplate: Template | null; reports: FinalReportSummary[]; studentWrittenReportWeight: number | string; componentWeights: ComponentWeights }) {
    const { data, setData, post, put, transform, processing, errors } = useForm<FormData>(blankData());
    const [activeType, setActiveType] = React.useState('Academic Supervisor');
    const [showReports, setShowReports] = React.useState(false);
    const [showWrittenReport, setShowWrittenReport] = React.useState(false);
    const [componentWeights, setComponentWeights] = React.useState<ComponentWeights>({
        academic_supervisor: initialComponentWeights?.academic_supervisor ?? 0,
        industry_supervisor: initialComponentWeights?.industry_supervisor ?? 0,
        student_written_report: initialComponentWeights?.student_written_report ?? studentWrittenReportWeight ?? 0,
    });
    const reportRubricForm = useForm<{ sections: Section[] }>({
        sections: reportRubricSections(writtenReportTemplate),
    });
    const [reportRubricDirty, setReportRubricDirty] = React.useState((writtenReportTemplate?.sections?.length ?? 0) > 1);
    const writtenReportForm = useForm({ weight: String(componentWeights.student_written_report), weights: componentWeights });
    const [draftFeedback, setDraftFeedback] = React.useState<'idle' | 'saving' | 'saved'>('idle');
    const [activationFeedback, setActivationFeedback] = React.useState<'idle' | 'saving' | 'active'>('idle');
    const drafts = React.useRef<Record<string, FormData>>({});
    const feedbackTimer = React.useRef<number | undefined>(undefined);
    const componentTypes = ['Academic Supervisor', 'Industry Supervisor'];
    const sectionWeightTotal = data.sections.reduce((sum, section) => sum + (Number(section.weight) || 0), 0);
    const combinedWeightTotal = Object.values(componentWeights).reduce<number>((sum, weight) => sum + (Number(weight) || 0), 0);
    const activationError = (errors as Record<string, string>).activation;
    const componentWeight = (type: string) => {
        return Number(componentWeights[type === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor']) || 0;
    };
    const savedTemplateReadiness = componentTypes.map((type) => {
        const key = type === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
        return { type, issues: savedTemplateIssues(latestTemplate(templates, type), Number(componentWeights[key]) || 0) };
    });
    function loadTemplate(type: string) {
        const item = templates.filter((template) => template.supervisor_type === type).sort((a, b) => b.version - a.version)[0];
        const componentKey = type === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
        if (!item) { setData({ ...blankData(type), component_weight: componentWeights[componentKey] }); return; }
        setData({ supervisor_type: type, component_weight: componentWeights[componentKey] ?? item.component_weight, is_active: item.is_active, sections: item.sections.map((section) => ({ ...section, criteria: section.criteria.map((criterion: any) => ({ ...criterion, levels: criterion.rating_levels ?? criterion.ratingLevels ?? [] })) })) });
    }
    function setComponentWeight(key: keyof ComponentWeights, value: number | string) {
        const next = { ...componentWeights, [key]: value };
        setComponentWeights(next);
        if (key === 'student_written_report') {
            writtenReportForm.setData('weight', String(value));
            writtenReportForm.setData('weights', next);
        } else if ((key === 'academic_supervisor' && activeType === 'Academic Supervisor') || (key === 'industry_supervisor' && activeType === 'Industry Supervisor')) {
            setData('component_weight', value);
        }
        return next;
    }
    function edit(type: string) {
        setShowReports(false);
        setShowWrittenReport(false);
        if (type === activeType) return;
        drafts.current[activeType] = data;
        setActiveType(type);
        const savedDraft = drafts.current[type];
        if (savedDraft) setData({ ...savedDraft, component_weight: componentWeights[type === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor'] });
        else loadTemplate(type);
    }
    function openWrittenReport() {
        drafts.current[activeType] = data;
        setShowReports(false);
        setShowWrittenReport(true);
    }
    useEffect(() => { loadTemplate('Academic Supervisor'); }, []);

    function changeSection(index: number, patch: Partial<Section>) {
        setData('sections', data.sections.map((section, i) => i === index ? { ...section, ...patch } : section));
    }
    function changeCriterion(sectionIndex: number, criterionIndex: number, patch: Partial<Criterion>) {
        setData('sections', data.sections.map((section, i) => i !== sectionIndex ? section : ({ ...section, criteria: section.criteria.map((criterion, j) => j === criterionIndex ? { ...criterion, ...patch } : criterion) })));
    }
    function changeLevel(sectionIndex: number, criterionIndex: number, levelIndex: number, patch: Partial<Level>) {
        setData('sections', data.sections.map((section, i) => i !== sectionIndex ? section : ({ ...section, criteria: section.criteria.map((criterion, j) => j !== criterionIndex ? criterion : ({ ...criterion, levels: criterion.levels.map((level, k) => k === levelIndex ? { ...level, ...patch } : level) })) })));
    }
    function changeReportSections(update: (sections: Section[]) => Section[]) {
        reportRubricForm.setData('sections', update(reportRubricForm.data.sections));
        setReportRubricDirty(true);
    }
    function changeReportSection(index: number, patch: Partial<Section>) {
        changeReportSections((sections) => sections.map((section, i) => i === index ? { ...section, ...patch } : section));
    }
    function changeReportCriterion(sectionIndex: number, criterionIndex: number, patch: Partial<Criterion>) {
        changeReportSection(sectionIndex, { criteria: reportRubricForm.data.sections[sectionIndex].criteria.map((criterion, i) => i === criterionIndex ? { ...criterion, ...patch } : criterion) });
    }
    function changeReportLevel(sectionIndex: number, criterionIndex: number, levelIndex: number, patch: Partial<Level>) {
        const criterion = reportRubricForm.data.sections[sectionIndex].criteria[criterionIndex];
        changeReportCriterion(sectionIndex, criterionIndex, { levels: criterion.levels.map((level, i) => i === levelIndex ? { ...level, ...patch } : level) });
    }
    function moveReportCriterion(sectionIndex: number, criterionIndex: number, offset: number) {
        const criteria = [...reportRubricForm.data.sections[sectionIndex].criteria];
        const target = criterionIndex + offset;
        if (target < 0 || target >= criteria.length) return;
        [criteria[criterionIndex], criteria[target]] = [criteria[target], criteria[criterionIndex]];
        changeReportSection(sectionIndex, { criteria });
    }
    function moveSection(index: number, offset: number) {
        const target = index + offset;
        if (target < 0 || target >= data.sections.length) return;
        const sections = [...data.sections];
        [sections[index], sections[target]] = [sections[target], sections[index]];
        setData('sections', sections);
    }
    function moveCriterion(sectionIndex: number, criterionIndex: number, offset: number) {
        const criteria = [...data.sections[sectionIndex].criteria];
        const target = criterionIndex + offset;
        if (target < 0 || target >= criteria.length) return;
        [criteria[criterionIndex], criteria[target]] = [criteria[target], criteria[criterionIndex]];
        changeSection(sectionIndex, { criteria });
    }
    function submit(event: FormEvent, activate: boolean) {
        event.preventDefault();
        if (activate && Math.abs(combinedWeightTotal - 100) > 0.001) {
            setDraftFeedback('idle');
            setActivationFeedback('idle');
            toast.error(activationWeightWarning(combinedWeightTotal));
            return;
        }
        if (activate) {
            const reportIssues = savedWrittenReportIssues(writtenReportTemplate ?? undefined);
            if (reportRubricDirty || reportIssues.length) {
                toast.warning(reportRubricDirty
                    ? 'Save the written report rubric draft before activating the evaluation.'
                    : `Student Written Report rubric: ${reportIssues.join(' ')}`);
                return;
            }
            const currentIssues = savedTemplateIssues({ sections: data.sections } as Template, Number(data.component_weight) || 0);
            const otherType = activeType === 'Academic Supervisor' ? 'Industry Supervisor' : 'Academic Supervisor';
            const otherKey = otherType === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
            const otherIssues = savedTemplateIssues(latestTemplate(templates, otherType), Number(componentWeights[otherKey]) || 0);
            if (currentIssues.length || otherIssues.length) {
                const details = [
                    ...currentIssues.map((issue) => `${activeType}: ${issue}`),
                    ...otherIssues.map((issue) => `${otherType}: ${issue}`),
                ];
                setActivationFeedback('idle');
                toast.warning(details.join(' '));
                return;
            }
        }

        const current = templates.filter((item) => item.supervisor_type === activeType).sort((a, b) => b.version - a.version)[0];
        transform((formData) => ({ ...formData, is_active: activate, weights: componentWeights }));
        const requestOptions = {
            onStart: () => {
                if (activate) setActivationFeedback('saving');
                else setDraftFeedback('saving');
            },
            onSuccess: () => {
                if (activate) {
                    setActivationFeedback('active');
                    window.clearTimeout(feedbackTimer.current);
                    feedbackTimer.current = window.setTimeout(() => setActivationFeedback('idle'), 2500);
                    return;
                }
                setDraftFeedback('saved');
                if (Math.abs(combinedWeightTotal - 100) > 0.001) toast.warning(draftWeightWarning(combinedWeightTotal));
                else toast.success('Evaluation template draft saved.');
                window.clearTimeout(feedbackTimer.current);
                feedbackTimer.current = window.setTimeout(() => setDraftFeedback('idle'), 2500);
            },
            onError: (validationErrors: Record<string, string>) => {
                if (activate) {
                    setActivationFeedback('idle');
                    const message = validationErrors.activation ?? validationErrors.sections ?? 'Activation failed. Review the component weights and supervisor template requirements.';
                    toast.error(String(message));
                } else {
                    setDraftFeedback('idle');
                    toast.error('The draft could not be saved. Review the form and try again.');
                }
            },
        };
        if (current) put(route('admin.evaluations.update', current.id), requestOptions);
        else post(route('admin.evaluations.store'), requestOptions);
    }

    function saveWrittenReportRubricDraft() {
        if (!reportRubricDirty) {
            writtenReportForm.transform((formData) => ({ ...formData, weights: componentWeights }));
            writtenReportForm.put(route('admin.evaluations.report-component'), {
                onSuccess: () => {
                    if (Math.abs(combinedWeightTotal - 100) > 0.001) toast.warning(draftWeightWarning(combinedWeightTotal));
                    else toast.success('Evaluation component draft saved.');
                },
                onError: () => toast.error('The evaluation component draft could not be saved.'),
            });
            return;
        }
        reportRubricForm.transform((formData) => ({ ...formData, weights: componentWeights }));
        reportRubricForm.post(route('admin.evaluations.report-rubric'), {
            preserveScroll: true,
            onSuccess: () => {
                setReportRubricDirty(false);
                if (Math.abs(combinedWeightTotal - 100) > 0.001) toast.warning(draftWeightWarning(combinedWeightTotal));
                else toast.success('Written report grading rubric draft saved.');
            },
            onError: () => toast.error('The written report rubric draft could not be saved. Review the fields and try again.'),
        });
    }

    function activateComponents() {
        if (Math.abs(combinedWeightTotal - 100) > 0.001) {
            toast.warning(activationWeightWarning(combinedWeightTotal));
            return;
        }
        const readinessErrors = savedTemplateReadiness.flatMap(({ type, issues }) => issues.map((issue) => `${type}: ${issue}`));
        if (readinessErrors.length) {
            toast.warning(readinessErrors.join(' '));
            return;
        }
        const reportIssues = savedWrittenReportIssues(writtenReportTemplate ?? undefined);
        if (reportIssues.length || reportRubricDirty) {
            toast.warning(reportRubricDirty
                ? 'Save the written report rubric draft before activating the evaluation.'
                : `Student Written Report rubric: ${reportIssues.join(' ')}`);
            return;
        }
        writtenReportForm.transform((formData) => ({ ...formData, weights: componentWeights }));
        writtenReportForm.post(route('admin.evaluations.activate'), {
            onSuccess: () => toast.success('All evaluation components are active.'),
            onError: (validationErrors: Record<string, string>) => toast.warning(String(validationErrors.activation ?? 'Activation failed. Review the validation details.')),
        });
    }

    return <AuthenticatedLayout>
        <Head title="Evaluation templates" />
        <div className="mx-auto w-full max-w-6xl space-y-6 p-5 md:p-8">
            <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700"><ClipboardCheck /></div>
                <div><h1 className="text-2xl font-bold text-slate-900">Evaluation templates</h1><p className="mt-1 text-sm text-slate-500">Build separate supervisor rubrics and the Student Written Report rubric. Submitted results keep their rubric snapshots.</p></div>
            </div>
            <div className="flex gap-2 rounded-xl bg-white p-2 shadow-sm">
                {componentTypes.map((type) => <button type="button" key={type} onClick={() => edit(type)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${!showReports && !showWrittenReport && type === activeType ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{type}</button>)}
                <button type="button" onClick={openWrittenReport} className={`rounded-lg px-4 py-2 text-sm font-semibold ${showWrittenReport ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Student Written Report</button>
                <button type="button" onClick={() => { setShowWrittenReport(false); setShowReports(true); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${showReports ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Report submissions</button>
            </div>
            {showWrittenReport ? <div className="space-y-5">
                <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5"><label className="block text-sm font-semibold text-slate-800">Student Written Report component weight</label><div className="mt-2 flex max-w-xs items-center rounded-lg border bg-white px-3"><input type="number" min="0" max="100" step="0.01" value={componentWeights.student_written_report} onChange={(event) => setComponentWeight('student_written_report', event.target.value)} className="w-full border-0 px-0 py-2 focus:ring-0" placeholder="0" /><span className="text-sm text-slate-500">%</span></div><p className="mt-2 text-sm text-slate-600">This is the share this component contributes to the student’s final overall score.</p></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">Overall evaluation components</h3><p className="mt-1 text-sm text-slate-500">Academic Supervisor, Industry Supervisor, and Written Report component weights must total 100% before activation.</p></div><span className={`rounded-full px-3 py-1 text-sm font-bold ${Math.abs(combinedWeightTotal - 100) <= 0.001 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{combinedWeightTotal.toFixed(2)}% total</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{componentTypes.map((type) => <div key={type} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{type}</p><p className="mt-1 text-lg font-bold">{componentWeight(type).toFixed(2)}%</p></div>)}<div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">Student Written Report</p><p className="mt-1 text-lg font-bold">{(Number(componentWeights.student_written_report) || 0).toFixed(2)}%</p></div></div></section>
                {reportRubricForm.data.sections.map((section, si) => <section key={si} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-bold"><Layers3 size={18} /> Written Report Section</h3><span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">100% of report mark</span></div>
                    <input value={section.title} onChange={(event) => changeReportSection(si, { title: event.target.value, weight: 100 })} placeholder="Section title" className="w-full rounded-lg border px-3 py-2" />
                    <textarea value={section.description ?? ''} onChange={(event) => changeReportSection(si, { description: event.target.value })} placeholder="Section description (optional)" className="w-full rounded-lg border px-3 py-2" rows={2} />
                    <div className="space-y-4 border-l-2 border-indigo-100 pl-4">{section.criteria.map((criterion, ci) => <div key={ci} className="space-y-3 rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2"><input value={criterion.title} onChange={(event) => changeReportCriterion(si, ci, { title: event.target.value })} placeholder="Grading criterion" className="flex-1 rounded-lg border bg-white px-3 py-2" /><button type="button" title="Move criterion up" disabled={ci === 0} onClick={() => moveReportCriterion(si, ci, -1)} className="text-slate-500 disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" title="Move criterion down" disabled={ci === section.criteria.length - 1} onClick={() => moveReportCriterion(si, ci, 1)} className="text-slate-500 disabled:opacity-30"><ArrowDown size={16} /></button><button type="button" disabled={section.criteria.length === 1} onClick={() => changeReportSection(si, { criteria: section.criteria.filter((_, i) => i !== ci) })} className="p-2 text-rose-600 disabled:opacity-30"><Trash2 size={17} /></button></div>
                        <textarea value={criterion.description ?? ''} onChange={(event) => changeReportCriterion(si, ci, { description: event.target.value })} placeholder="What does this criterion assess?" className="w-full rounded-lg border px-3 py-2" rows={2} />
                        <div className="space-y-2">{criterion.levels.map((level, li) => <div key={li} className="grid gap-2 md:grid-cols-[1fr_100px_auto]"><div className="space-y-2"><input value={level.title} onChange={(event) => changeReportLevel(si, ci, li, { title: event.target.value })} placeholder="Grading level title" className="w-full rounded-lg border px-3 py-2" /><input value={level.description ?? ''} onChange={(event) => changeReportLevel(si, ci, li, { description: event.target.value })} placeholder="Description" className="w-full rounded-lg border px-3 py-2 text-sm" /></div><label className="flex h-10 items-center gap-2 rounded-lg border bg-white px-3"><input type="number" min="0" value={level.points ?? ''} onChange={(event) => changeReportLevel(si, ci, li, { points: event.target.value })} className="w-full border-0 px-0 focus:ring-0" /><span className="text-xs text-slate-500">pts</span></label><button type="button" disabled={criterion.levels.length === 1} onClick={() => changeReportCriterion(si, ci, { levels: criterion.levels.filter((_, i) => i !== li) })} className="p-2 text-rose-600 disabled:opacity-30"><Trash2 size={17} /></button></div>)}</div>
                        <button type="button" onClick={() => changeReportCriterion(si, ci, { levels: [...criterion.levels, { title: '', description: '', points: '' }] })} className="text-sm font-semibold text-indigo-700">+ Add grading level</button>
                    </div>)}<button type="button" onClick={() => changeReportSection(si, { criteria: [...section.criteria, blankCriterion()] })} className="text-sm font-semibold text-indigo-700">+ Add criterion</button></div>
                </section>)}
                <p className="text-sm text-slate-600">The single Written Report section contributes 100% of the report mark. The report component’s share of the student’s final overall score is configured separately above.</p>
                {reportRubricForm.errors.sections && <p className="text-sm text-rose-600">{reportRubricForm.errors.sections}</p>}
                <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={writtenReportForm.processing || reportRubricForm.processing} onClick={saveWrittenReportRubricDraft} className="rounded-lg border px-5 py-3 font-semibold text-indigo-700">{writtenReportForm.processing || reportRubricForm.processing ? 'Saving…' : 'Save draft'}</button><button type="button" disabled={writtenReportForm.processing || reportRubricForm.processing} onClick={activateComponents} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white">Save and activate all</button></div>
            </div> : !showReports ? <form className="space-y-5" onSubmit={(e) => submit(e, false)}>
                <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5"><label className="block text-sm font-semibold text-slate-800">{activeType} component weight</label><div className="mt-2 flex max-w-xs items-center rounded-lg border bg-white px-3"><input type="number" min="0" max="100" step="0.01" value={componentWeights[activeType === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor']} onChange={(e) => setComponentWeight(activeType === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor', e.target.value)} className="w-full border-0 px-0 py-2 focus:ring-0" placeholder="0" /><span className="text-sm text-slate-500">%</span></div><p className="mt-2 text-sm text-slate-600">This is the share this component contributes to the student’s final overall score.</p></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Overall evaluation components</h2><p className="mt-1 text-sm text-slate-500">Academic Supervisor, Industry Supervisor, and Written Report component weights must total 100% before activation.</p></div><span className={`rounded-full px-3 py-1 text-sm font-bold ${Math.abs(combinedWeightTotal - 100) <= 0.001 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{combinedWeightTotal.toFixed(2)}% total</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{componentTypes.map((type) => <div key={type} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{type}</p><p className="mt-1 text-lg font-bold text-slate-900">{componentWeight(type).toFixed(2)}%</p></div>)}<div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">Student Written Report</p><p className="mt-1 text-lg font-bold text-slate-900">{(Number(componentWeights.student_written_report) || 0).toFixed(2)}%</p></div></div></section>
                {data.sections.map((section, si) => <section key={si} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold"><Layers3 size={18} /> Section {si + 1}</h2><div className="flex items-center gap-3"><button type="button" title="Move section up" disabled={si === 0} onClick={() => moveSection(si, -1)} className="text-slate-500 disabled:opacity-30"><ArrowUp size={17} /></button><button type="button" title="Move section down" disabled={si === data.sections.length - 1} onClick={() => moveSection(si, 1)} className="text-slate-500 disabled:opacity-30"><ArrowDown size={17} /></button><button type="button" disabled={data.sections.length === 1} onClick={() => setData('sections', data.sections.filter((_, i) => i !== si))} className="text-rose-600 disabled:opacity-30"><Trash2 size={18} /></button></div></div>
                    <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                        <input value={section.title} onChange={(e) => changeSection(si, { title: e.target.value })} placeholder="Section title" className="rounded-lg border px-3 py-2" />
                        <label className="flex items-center gap-2 rounded-lg border px-3"><input type="number" min="0" max="100" step="0.01" value={section.weight ?? ''} onChange={(e) => changeSection(si, { weight: e.target.value })} className="w-full border-0 px-0 py-2 focus:ring-0" /><span className="text-sm text-slate-500">%</span></label>
                    </div>
                    <textarea value={section.description ?? ''} onChange={(e) => changeSection(si, { description: e.target.value })} placeholder="Section description (optional)" className="w-full rounded-lg border px-3 py-2" rows={2} />
                    <div className="space-y-4 border-l-2 border-indigo-100 pl-4">
                        {section.criteria.map((criterion, ci) => <div key={ci} className="space-y-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2"><input value={criterion.title} onChange={(e) => changeCriterion(si, ci, { title: e.target.value })} placeholder="Criterion title" className="flex-1 rounded-lg border bg-white px-3 py-2" /><button type="button" title="Move criterion up" disabled={ci === 0} onClick={() => moveCriterion(si, ci, -1)} className="text-slate-500 disabled:opacity-30"><ArrowUp size={16} /></button><button type="button" title="Move criterion down" disabled={ci === section.criteria.length - 1} onClick={() => moveCriterion(si, ci, 1)} className="text-slate-500 disabled:opacity-30"><ArrowDown size={16} /></button><button type="button" disabled={section.criteria.length === 1} onClick={() => changeSection(si, { criteria: section.criteria.filter((_, i) => i !== ci) })} className="text-rose-600 disabled:opacity-30"><Trash2 size={17} /></button></div>
                            <textarea value={criterion.description ?? ''} onChange={(e) => changeCriterion(si, ci, { description: e.target.value })} placeholder="What does this criterion assess?" className="w-full rounded-lg border px-3 py-2" rows={2} />
                            <div className="space-y-2">{criterion.levels.map((level, li) => <div key={li} className="grid gap-2 md:grid-cols-[1fr_100px_auto]">
                                <div className="space-y-2"><input value={level.title} onChange={(e) => changeLevel(si, ci, li, { title: e.target.value })} placeholder="Grading level title" className="w-full rounded-lg border px-3 py-2" /><input value={level.description ?? ''} onChange={(e) => changeLevel(si, ci, li, { description: e.target.value })} placeholder="Description" className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                                <label className="flex h-10 items-center gap-2 rounded-lg border bg-white px-3"><input type="number" min="0" value={level.points ?? ''} onChange={(e) => changeLevel(si, ci, li, { points: e.target.value })} className="w-full border-0 px-0 focus:ring-0" /><span className="text-xs text-slate-500">pts</span></label>
                                <button type="button" disabled={criterion.levels.length <= 1} onClick={() => changeCriterion(si, ci, { levels: criterion.levels.filter((_, i) => i !== li) })} className="p-2 text-rose-600 disabled:opacity-30"><Trash2 size={17} /></button>
                            </div>)}</div>
                            <button type="button" onClick={() => changeCriterion(si, ci, { levels: [...criterion.levels, { title: '', description: '', points: '' }] })} className="text-sm font-semibold text-indigo-700">+ Add grading level</button>
                        </div>)}
                        <button type="button" onClick={() => changeSection(si, { criteria: [...section.criteria, blankCriterion()] })} className="text-sm font-semibold text-indigo-700">+ Add criterion</button>
                    </div>
                </section>)}
                <button type="button" onClick={() => setData('sections', [...data.sections, blankSection()])} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-4 py-3 font-semibold text-indigo-700"><Plus size={18} /> Add section</button>
                <div className="text-sm text-slate-600">
                    <p>{activeType} sections: <span className={`font-semibold ${Math.abs(sectionWeightTotal - (Number(data.component_weight) || 0)) <= 0.001 ? 'text-emerald-700' : 'text-amber-700'}`}>{sectionWeightTotal.toFixed(2)}%</span> of {formatPercent(Number(data.component_weight) || 0)}% allocation. All three overall components: <span className={`font-semibold ${Math.abs(combinedWeightTotal - 100) <= 0.001 ? 'text-emerald-700' : 'text-amber-700'}`}>{combinedWeightTotal.toFixed(2)}%</span>. Each supervisor's section subtotal must match that supervisor's allocation; the three component allocations must total 100%.</p>
                </div>
                {errors.sections && <p className="text-sm text-red-600">{errors.sections}</p>}
                {activationError && <p className="text-sm text-red-600">{activationError}</p>}
                <div className="flex flex-wrap justify-end gap-3"><button disabled={processing} type="submit" aria-live="polite" className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-lg border px-5 py-3 font-semibold transition-all duration-200 disabled:cursor-wait disabled:opacity-70 ${draftFeedback === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : draftFeedback === 'saving' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50'}`}>
                    {draftFeedback === 'saving' ? <LoaderCircle size={17} className="animate-spin" /> : draftFeedback === 'saved' ? <CheckCircle2 size={17} /> : <Save size={17} />}
                    {draftFeedback === 'saving' ? 'Saving draft…' : draftFeedback === 'saved' ? 'Draft saved' : 'Save draft'}
                </button><button disabled={processing} type="button" aria-live="polite" onClick={(e) => submit(e as any, true)} className={`inline-flex min-w-44 items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold text-white transition-all duration-200 disabled:cursor-wait disabled:opacity-70 ${activationFeedback === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {activationFeedback === 'saving' ? <LoaderCircle size={17} className="animate-spin" /> : activationFeedback === 'active' ? <CheckCircle2 size={17} /> : null}
                    {activationFeedback === 'saving' ? 'Activating all…' : activationFeedback === 'active' ? 'All components active' : 'Save and activate all'}
                </button></div>
            </form> : <ReportList reports={reports} />}
        </div>
    </AuthenticatedLayout>;
}

function ReportList({ reports }: { reports: FinalReportSummary[] }) {
    const tone = (status: string) => status === 'Completed' || status === 'Approved' || status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : status === 'Incomplete' || status === 'Changes Required' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';
    return <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="text-lg font-bold text-slate-900">Student final reports</h2><p className="mt-1 text-sm text-slate-500">Submission status and overall completion summaries.</p></div>{reports.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No final internship reports have been created yet.</p> : <div className="divide-y">{reports.map((report) => <div key={report.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-slate-900">{report.student?.full_name ?? 'Student'}</p><p className="mt-1 text-sm text-slate-500">{report.student?.pb_student_code} · {report.title || 'Untitled draft'}{report.report_score !== null ? ` · Written report: ${report.report_score}%` : ''}{report.overall_score !== null ? ` · Overall score: ${report.overall_score}%` : ''}</p></div><div className="flex flex-wrap items-center gap-2 text-xs font-semibold"><span className={`rounded-full px-2.5 py-1 ${tone(report.completion_status)}`}>{report.completion_status}</span><span className={`rounded-full px-2.5 py-1 ${tone(report.academic_review_status)}`}>Report: {report.academic_review_status}</span><span className={`rounded-full px-2.5 py-1 ${tone(report.industry_confirmation_status)}`}>Company: {report.industry_confirmation_status}</span><span className={`rounded-full px-2.5 py-1 ${tone(report.academic_completion_status)}`}>Academic decision: {report.academic_completion_status}</span></div></div>)}</div>}</section>;
}
