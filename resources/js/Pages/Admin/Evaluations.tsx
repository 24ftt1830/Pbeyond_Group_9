import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ClipboardCheck, Save, CheckCircle2, LoaderCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import RubricEditor, { emptySection as blankSection, evaluationInputClass, type RubricLevel as Level, type RubricSection as Section } from '@/Components/Evaluations/RubricEditor';

type Template = { id: number; name: string; supervisor_type: string; component_weight: number | string; version: number; is_active: boolean; sections: Section[] };
type FormData = { supervisor_type: string; component_weight: number | string | null; is_active: boolean; sections: Section[] };
type ComponentWeights = { academic_supervisor: number | string; industry_supervisor: number | string; student_written_report: number | string };
type FinalReportSummary = { id: number; title: string; submitted_at?: string | null; academic_review_status: string; industry_confirmation_status: string; academic_completion_status: string; report_score: number | string | null; completion_status: string; overall_score: number | null; student?: { student_id: number; full_name: string; pb_student_code: string } | null };

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
                onStart: () => setDraftFeedback('saving'),
                onSuccess: () => {
                    showDraftSaved();
                    if (Math.abs(combinedWeightTotal - 100) > 0.001) toast.warning(draftWeightWarning(combinedWeightTotal));
                    else toast.success('Evaluation component draft saved.');
                },
                onError: () => { setDraftFeedback('idle'); toast.error('The evaluation component draft could not be saved.'); },
            });
            return;
        }
        reportRubricForm.transform((formData) => ({ ...formData, weights: componentWeights }));
        reportRubricForm.post(route('admin.evaluations.report-rubric'), {
            preserveScroll: true,
            onStart: () => setDraftFeedback('saving'),
            onSuccess: () => {
                showDraftSaved();
                setReportRubricDirty(false);
                if (Math.abs(combinedWeightTotal - 100) > 0.001) toast.warning(draftWeightWarning(combinedWeightTotal));
                else toast.success('Written report grading rubric draft saved.');
            },
            onError: () => { setDraftFeedback('idle'); toast.error('The written report rubric draft could not be saved. Review the fields and try again.'); },
        });
    }

    function showDraftSaved() {
        setDraftFeedback('saved');
        window.clearTimeout(feedbackTimer.current);
        feedbackTimer.current = window.setTimeout(() => setDraftFeedback('idle'), 2500);
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
            onStart: () => setActivationFeedback('saving'),
            onSuccess: () => {
                setActivationFeedback('active');
                window.clearTimeout(feedbackTimer.current);
                feedbackTimer.current = window.setTimeout(() => setActivationFeedback('idle'), 2500);
                toast.success('All evaluation components are active.');
            },
            onError: (validationErrors: Record<string, string>) => { setActivationFeedback('idle'); toast.warning(String(validationErrors.activation ?? 'Activation failed. Review the validation details.')); },
        });
    }

    const selectedComponent: keyof ComponentWeights = showWrittenReport ? 'student_written_report' : activeType === 'Academic Supervisor' ? 'academic_supervisor' : 'industry_supervisor';
    const reportActivationError = (writtenReportForm.errors as Record<string, string>).activation;
    const weightPanel = <ComponentWeightPanel weights={componentWeights} total={combinedWeightTotal} selected={selectedComponent} onChange={setComponentWeight} errors={{ ...(errors as Record<string, string>), ...(writtenReportForm.errors as Record<string, string>), ...(reportRubricForm.errors as Record<string, string>) }} />;

    return <AuthenticatedLayout>
        <Head title="Evaluation templates" />
        <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <header className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600"><ClipboardCheck size={23} /></div>
                <div><h1 className="font-sato text-3xl font-bold text-slate-900">Evaluation templates</h1><p className="mt-2 text-sm leading-6 text-slate-500">Manage assessment rubrics and their share of the final score.</p></div>
            </header>

            <nav aria-label="Evaluation types" className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm lg:grid-cols-4">
                {componentTypes.map((type) => <button type="button" key={type} aria-pressed={!showReports && !showWrittenReport && type === activeType} onClick={() => edit(type)} className={`min-w-0 rounded-xl px-3 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${!showReports && !showWrittenReport && type === activeType ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>{type}</button>)}
                <button type="button" aria-pressed={showWrittenReport} onClick={openWrittenReport} className={`min-w-0 rounded-xl px-3 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${showWrittenReport ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>Written Report</button>
                <button type="button" aria-pressed={showReports} onClick={() => { setShowWrittenReport(false); setShowReports(true); }} className={`min-w-0 rounded-xl px-3 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${showReports ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>Report submissions</button>
            </nav>

            {showWrittenReport ? <div className="space-y-7">
                {weightPanel}
                <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Written Report rubric</h2><p className="mt-1 text-sm text-slate-500">Open a criterion to edit its grading levels.</p></div><span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">One section · 100% of report mark</span></div>
                <RubricEditor key="written-report" sections={reportRubricForm.data.sections} onChange={(sections) => { reportRubricForm.setData('sections', sections); setReportRubricDirty(true); }} fixedSectionWeight={100} errors={reportRubricForm.errors as Record<string, string>} />
                <p className="text-sm leading-6 text-slate-500">The rubric determines the report mark. Its contribution to the final score uses the Written Report component weight above.</p>
                {reportRubricForm.errors.sections && <p role="alert" className="text-sm text-rose-600">{reportRubricForm.errors.sections}</p>}
                {reportActivationError && <p role="alert" className="text-sm text-rose-600">{reportActivationError}</p>}
                <EvaluationActions processing={writtenReportForm.processing || reportRubricForm.processing} draftState={draftFeedback} activationState={activationFeedback} onSave={saveWrittenReportRubricDraft} onActivate={activateComponents} />
            </div> : !showReports ? <form className="space-y-7" onSubmit={(event) => submit(event, false)}>
                {weightPanel}
                <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{activeType} rubric</h2><p className="mt-1 text-sm text-slate-500">Open a criterion to edit its grading levels.</p></div><span className={`rounded-lg border px-3 py-2 text-xs font-semibold ${Math.abs(sectionWeightTotal - (Number(data.component_weight) || 0)) <= 0.001 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>Sections: {formatPercent(sectionWeightTotal)}% / {formatPercent(Number(data.component_weight) || 0)}%</span></div>
                <RubricEditor key={activeType} sections={data.sections} onChange={(sections) => setData('sections', sections)} errors={errors as Record<string, string>} />
                <p className="text-sm leading-6 text-slate-500">Section weights must add up to this assessment’s {formatPercent(Number(data.component_weight) || 0)}% component weight.</p>
                {errors.sections && <p role="alert" className="text-sm text-rose-600">{errors.sections}</p>}
                {activationError && <p role="alert" className="text-sm text-rose-600">{activationError}</p>}
                <EvaluationActions processing={processing} draftState={draftFeedback} activationState={activationFeedback} onActivate={(event) => submit(event, true)} />
            </form> : <ReportList reports={reports} />}
        </div>
    </AuthenticatedLayout>;
}

function ComponentWeightPanel({ weights, total, selected, onChange, errors }: { weights: ComponentWeights; total: number; selected: keyof ComponentWeights; onChange: (key: keyof ComponentWeights, value: number | string) => void; errors: Record<string, string> }) {
    const items: { key: keyof ComponentWeights; label: string }[] = [
        { key: 'academic_supervisor', label: 'Academic Supervisor' },
        { key: 'industry_supervisor', label: 'Industry Supervisor' },
        { key: 'student_written_report', label: 'Written Report' },
    ];
    const complete = Math.abs(total - 100) <= 0.001;
    return <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold text-slate-800">Assessment weights</h2><p className="mt-0.5 text-xs text-slate-500">Set the share for each assessment. Total must be 100%.</p></div><span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold tabular-nums ${complete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{complete && <CheckCircle2 size={13} />}{formatPercent(total)}% / 100%</span></div>
        <div className="mt-3 grid divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {items.map(({ key, label }) => {
                const editable = key === selected;
                const error = errors[`weights.${key}`] || (editable ? errors.component_weight || errors.weight : undefined);
                return <div key={key} className="flex min-w-0 items-center justify-between gap-3 py-2.5 sm:px-4 sm:first:pl-0 sm:last:pr-0">
                    <span className="text-sm text-slate-600">{label}{editable && <span className="ml-1.5 text-xs text-indigo-600">Editing</span>}</span>
                    <div className="shrink-0">
                        {editable ? <div className="flex items-center gap-1.5"><input id={`component-${key}`} aria-label={`${label} component weight`} aria-invalid={!!error} type="number" min="0" max="100" step="0.01" value={weights[key]} onChange={(event) => onChange(key, event.target.value)} placeholder="0" className="w-20 rounded-md border border-indigo-200 bg-indigo-50/50 px-2 py-1.5 text-right text-sm font-semibold tabular-nums text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15" /><span className="text-sm text-slate-500">%</span></div> : <span className="text-sm font-semibold tabular-nums text-slate-800">{formatPercent(Number(weights[key]) || 0)}%</span>}
                        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
                    </div>
                </div>;
            })}
        </div>
    </section>;
}

function EvaluationActions({ processing, draftState, activationState, onSave, onActivate }: { processing: boolean; draftState: 'idle' | 'saving' | 'saved'; activationState: 'idle' | 'saving' | 'active'; onSave?: () => void; onActivate: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
    return <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
        <p className="text-sm text-slate-500">Save your draft before activating all assessments.</p>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <button type={onSave ? 'button' : 'submit'} onClick={onSave} disabled={processing} aria-live="polite" className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:flex-none ${draftState === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {draftState === 'saving' ? <LoaderCircle size={16} className="animate-spin" /> : draftState === 'saved' ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {draftState === 'saving' ? 'Saving draft…' : draftState === 'saved' ? 'Draft saved' : 'Save draft'}
            </button>
            <button type="button" onClick={onActivate} disabled={processing} aria-live="polite" className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:flex-none ${activationState === 'active' ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {activationState === 'saving' ? <LoaderCircle size={16} className="animate-spin" /> : activationState === 'active' ? <CheckCircle2 size={16} /> : null}
                {activationState === 'saving' ? 'Activating all…' : activationState === 'active' ? 'All assessments active' : 'Activate all'}
            </button>
        </div>
    </div>;
}


function ReportList({ reports }: { reports: FinalReportSummary[] }) {
    const tone = (status: string) => status === 'Completed' || status === 'Approved' || status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : status === 'Incomplete' || status === 'Changes Required' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';
    return <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="text-lg font-bold text-slate-900">Student final reports</h2><p className="mt-1 text-sm text-slate-500">Submission status and overall completion summaries.</p></div>{reports.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No final internship reports have been created yet.</p> : <div className="divide-y">{reports.map((report) => <div key={report.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold text-slate-900">{report.student?.full_name ?? 'Student'}</p><p className="mt-1 text-sm text-slate-500">{report.student?.pb_student_code} · {report.title || 'Untitled draft'}{report.report_score !== null ? ` · Written report: ${report.report_score}%` : ''}{report.overall_score !== null ? ` · Overall score: ${report.overall_score}%` : ''}</p></div><div className="flex flex-wrap items-center gap-2 text-xs font-semibold"><span className={`rounded-full px-2.5 py-1 ${tone(report.completion_status)}`}>{report.completion_status}</span><span className={`rounded-full px-2.5 py-1 ${tone(report.academic_review_status)}`}>Report: {report.academic_review_status}</span><span className={`rounded-full px-2.5 py-1 ${tone(report.industry_confirmation_status)}`}>Company: {report.industry_confirmation_status}</span><span className={`rounded-full px-2.5 py-1 ${tone(report.academic_completion_status)}`}>Academic decision: {report.academic_completion_status}</span></div></div>)}</div>}</section>;
}
