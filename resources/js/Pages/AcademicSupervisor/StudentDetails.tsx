import { roleLabel } from '@/lib/role-labels';
import { attendanceBasisLabel, attendanceLabel, type AttendanceSummary } from '@/lib/attendance';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmAction } from '@/lib/confirm-action';
import BackButton from '@/Components/BackButton';
import LogbookCorrectionNotice, { type PendingLogbookCorrection } from '@/Components/LogbookCorrectionNotice';
import InternshipCompletionHistory, { type CompletionHistoryEntry } from '@/Components/InternshipCompletionHistory';
import {
    User,
    GraduationCap,
    Phone,
    Mail,
    MapPin,
    CalendarDays,
    Briefcase,
    Award,
    Languages,
    Wrench,
    FolderKanban,
    Activity,
    UserRound,
    ClipboardCheck,
    CheckCircle2,
    Loader2,
    Star,
} from 'lucide-react';

interface Programme {
    programme_id: number;
    programme_name?: string;
}

interface Skill {
    skill_name?: string;
    name?: string;
}

interface Language {
    language_name?: string;
    name?: string;
    proficiency?: string;
}

interface Education {
    institution?: string;
    qualification?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
}

interface ProfessionalProfile {
    summary?: string;
    career_objective?: string;
}

interface Project {
    project_name?: string;
    title?: string;
    description?: string;
}

interface ActivityItem {
    activity_name?: string;
    title?: string;
    description?: string;
}

interface Achievement {
    achievement_name?: string;
    title?: string;
    description?: string;
}

interface Referee {
    name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    position?: string;
}

interface SoftSkill {
    skill_name?: string;
    name?: string;
}

interface WorkExperience {
    company_name?: string;
    position?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
}

interface InternshipVisit {
    visit_id: number;
    visit_date: string;
    notes: string;
}

interface Evaluation {
    attendance_punctuality: number;
    work_quality: number;
    technical_skills: number;
    communication_skills: number;
    teamwork: number;
    initiative: number;
    professionalism: number;
    strengths?: string | null;
    areas_for_improvement?: string | null;
    comments?: string | null;
    recommendation: string;
    academic_review_status: 'Pending Review' | 'Completed';
    academic_reviewed_at?: string | null;
}

interface DynamicEvaluation {
    id: number;
    reopened_at?: string | null;
    overall_score: number | string;
    submitted_at: string;
    template_snapshot: { name?: string; version?: number };
    answers: Record<string, { section: string; section_weight: number; criterion: string; level: string; points: number }>;
    comments?: string | null;
}

interface Student {
    student_id: number;
    pb_student_code: string;
    user_id: number;
    full_name: string;
    vetting_status?: string;
    ic_number?: string;
    ic_colour?: string;
    programme?: Programme;
    intake_session?: string;
    postal_address?: string;
    date_of_birth?: string;
    place_of_birth?: string;
    gender?: string;
    religion?: string;
    nationality?: string;
    race?: string;
    mobile_phone?: string;
    cgpa?: number | string;
    work_experience?: string;
    emergency_no?: string;
    emergency_no_2?: string;
    emergency_contact_name?: string | null;
    emergency_contact_relationship?: string | null;
    emergency_contact_name_2?: string | null;
    emergency_contact_relationship_2?: string | null;
    insurance_document_path?: string;
    cv_file_path?: string;
    passport_photo_path?: string;

    skills?: Skill[];
    languages?: Language[];
    education?: Education[];
    professional_profile?: ProfessionalProfile;
    professionalProfile?: ProfessionalProfile;
    projects?: Project[];
    activities?: ActivityItem[];
    achievements?: Achievement[];
    referees?: Referee[];
    soft_skills?: SoftSkill[];
    softSkills?: SoftSkill[];
    work_experiences?: WorkExperience[];
    workExperiences?: WorkExperience[];
}

interface Props {
    student: Student;
    visits: InternshipVisit[];
    evaluation: Evaluation | null;
    academicEvaluation: DynamicEvaluation | null;
    industryEvaluation: DynamicEvaluation | null;
    hasActiveEvaluationTemplate: boolean;
    monitoringStatus: 'On Track' | 'Needs Attention' | 'At Risk';
    finalReport: { submitted_at?: string | null; academic_review_status: string; report_score?: number | string | null } | null;
    completionRecord: {
        industry_confirmation_status: 'Pending Confirmation' | 'Confirmed' | 'Changes Required';
        industry_confirmed_at?: string | null;
        academic_completion_status: 'Pending Evaluation' | 'Completed' | 'Incomplete';
        academic_completion_decided_at?: string | null;
    } | null;
    canFinalizeCompleted: boolean;
    canFinalizeIncomplete: boolean;
    completionStatus: 'Pending Evaluation' | 'Incomplete' | 'Completed';
    pendingLogbookCorrections?: PendingLogbookCorrection[];
    completionHistory?: CompletionHistoryEntry[];
    overallScore: number | null;
    attendance: AttendanceSummary;
}

const display = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') {
        return 'Not provided';
    }

    return String(value);
};

const formatDate = (value?: string | null) => {
    if (!value) return 'Not provided';

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value;

    const date = new Date(Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
    ));

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};

const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return null;

    return `${start ? formatDate(start) : 'Start date not provided'} – ${end ? formatDate(end) : 'Present'}`;
};

export default function StudentDetails({ student, visits, evaluation, academicEvaluation, industryEvaluation, hasActiveEvaluationTemplate, monitoringStatus, finalReport, completionRecord, canFinalizeCompleted, canFinalizeIncomplete, completionStatus, overallScore, attendance, pendingLogbookCorrections = [], completionHistory = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'assessments' | 'confirmation'>('overview');
    const [editingCompletionDecision, setEditingCompletionDecision] = useState(false);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        visit_date: '',
        notes: '',
    });

    const {
        data: statusData,
        setData: setStatusData,
        put: updateStatus,
        processing: updatingStatus,
    } = useForm({
        monitoring_status: monitoringStatus,
    });

    const submitVisit = (event: FormEvent) => {
        event.preventDefault();

        post(
            route(
                'academic-supervisor.student.visits.store',
                student.student_id
            ),
            {
                onSuccess: () => reset(),
            }
        );
    };

    const submitMonitoringStatus = (event: FormEvent) => {
        event.preventDefault();

        updateStatus(
            route(
                'academic-supervisor.student.monitoring-status.update',
                student.student_id
            ),
            {
                preserveScroll: true,
            }
        );
    };

    const { post: postComplete, processing: completing } = useForm({});

    const completionDecisionForm = useForm<{
        decision: 'Completed' | 'Incomplete';
    }>({
        decision: completionRecord?.academic_completion_status === 'Incomplete' ? 'Incomplete' : 'Completed',
    });

    const saveCompletionDecision = async (decision: 'Completed' | 'Incomplete') => {
        if (completionDecisionForm.processing) return;
        const completed = decision === 'Completed';
        if (!(await confirmAction(completed
            ? `Record the final school decision that ${student.full_name} has completed the internship? This locks the company confirmation.`
            : `Record the final school decision that ${student.full_name}'s internship is incomplete?`, {
            title: completed ? 'Confirm internship completed?' : 'Mark internship incomplete?',
            confirmLabel: completed ? 'Confirm completed' : 'Mark incomplete',
            destructive: !completed,
        }))) return;
        completionDecisionForm.transform((data) => ({ ...data, decision }));
        completionDecisionForm.put(route('academic-supervisor.student.completion-decision.update', student.student_id), {
            preserveScroll: true,
            onSuccess: () => setEditingCompletionDecision(false),
            onFinish: () => completionDecisionForm.transform((data) => data),
        });
    };

    const markEvaluationCompleted = async () => {
        if (completing) return;
        if (!(await confirmAction(`Mark ${student.full_name}'s evaluation review as completed?`, { title: 'Complete evaluation review?', confirmLabel: 'Mark completed' }))) return;
        postComplete(
            route(
                'academic-supervisor.student.evaluation.complete',
                student.student_id
            ),
            { preserveScroll: true }
        );
    };

    const professionalProfile =
        student.professionalProfile ?? student.professional_profile;

    const softSkills =
        student.softSkills ?? student.soft_skills ?? [];

    const workExperiences =
        student.workExperiences ?? student.work_experiences ?? [];

    const reportReviewStatus = finalReport?.submitted_at
        ? finalReport.academic_review_status
        : 'Not Submitted';

    const completionChecklist = [
        {
            label: 'Company Internship Completion',
            state: completionRecord?.industry_confirmation_status === 'Confirmed'
                ? 'Confirmed'
                : completionRecord?.industry_confirmation_status === 'Changes Required'
                    ? 'Requirements incomplete'
                    : 'Awaiting confirmation',
        },
        { label: 'PB Supervisor evaluation', state: academicEvaluation?.reopened_at ? 'Pending correction' : academicEvaluation ? 'Submitted' : 'Pending' },
        { label: 'Industry Supervisor evaluation', state: industryEvaluation?.reopened_at ? 'Pending correction' : industryEvaluation ? 'Submitted' : 'Pending' },
        {
            label: 'Written report',
            state: !finalReport?.submitted_at
                ? 'Not submitted'
                : finalReport.academic_review_status === 'Approved'
                    ? 'Approved and marked'
                    : finalReport.academic_review_status === 'Changes Required'
                        ? 'Changes required'
                        : 'Pending review',
        },
    ];

    const monitoringTone = {
        'On Track': 'border-emerald-200 bg-emerald-50 text-emerald-700',
        'Needs Attention': 'border-amber-200 bg-amber-50 text-amber-700',
        'At Risk': 'border-rose-200 bg-rose-50 text-rose-700',
    }[monitoringStatus];

    return (
        <AuthenticatedLayout>
            <Head title={`${student.full_name} - Student Details`} />

            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <header className="bg-slate-50">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <BackButton href={route('academic-supervisor.students')}>
                                Back to My Students
                            </BackButton>
                            {hasActiveEvaluationTemplate || academicEvaluation ? (
                                <Link
                                    href={route('academic-supervisor.student.evaluate', student.student_id)}
                                    className="ui-button ui-button-primary inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                                >
                                    <ClipboardCheck size={16} />
                                    {academicEvaluation?.reopened_at ? 'Revise Evaluation' : academicEvaluation ? 'View Evaluation' : 'Evaluate Student'}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    title="The Admin has not activated an PB Supervisor evaluation template yet."
                                    className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
                                >
                                    <ClipboardCheck size={16} />
                                    Evaluation unavailable
                                </button>
                            )}
                        </div>

                        <div className="ui-card border-blue-100 bg-blue-50/40 p-6">



                            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-900 ">
                                    <UserRound size={36} strokeWidth={1.6} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                        PB Supervisor · Student Record
                                    </p>

                                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                        {student.full_name}
                                    </h1>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="ui-badge inline-flex items-center gap-2 border border-blue-100 bg-white text-xs font-medium text-slate-600">
                                            <User size={14} className="text-primary" />
                                            {student.pb_student_code}
                                        </span>

                                        {student.programme?.programme_name && (
                                            <span className="ui-badge inline-flex items-center gap-2 border border-blue-100 bg-white text-xs font-medium text-slate-600">
                                                <GraduationCap size={14} className="text-primary" />
                                                {student.programme.programme_name}
                                            </span>
                                        )}

                                        {student.intake_session && (
                                            <span className="ui-badge inline-flex items-center gap-2 border border-blue-100 bg-white text-xs font-medium text-slate-600">
                                                <CalendarDays size={14} className="text-primary" />
                                                {student.intake_session}
                                            </span>
                                        )}

                                        <span className={'ui-badge ' + (`inline-flex items-center gap-2 border text-xs ${monitoringTone}`)}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            {monitoringStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 pb-16 sm:px-6 lg:px-8">
                    <LogbookCorrectionNotice weeks={pendingLogbookCorrections} />
                    <div className="grid w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm xl:grid-cols-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={'ui-tab ' + (`flex min-h-10 w-full items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-semibold leading-5 transition ${activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`)}
                        >
                            Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={'ui-tab ' + (`flex min-h-10 w-full items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-semibold leading-5 transition ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`)}
                        >
                            Background &amp; Skills
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('assessments')}
                            className={'ui-tab ' + (`flex min-h-10 w-full items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-semibold leading-5 transition ${activeTab === 'assessments' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`)}
                        >
                            Written Report &amp; Evaluations
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('confirmation')}
                            className={'ui-tab ' + (`flex min-h-10 w-full items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-semibold leading-5 transition ${activeTab === 'confirmation' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`)}
                        >
                            Internship Confirmation
                        </button>
                    </div>

                    {activeTab !== 'profile' && (
                    <div className="space-y-6">
                    {activeTab === 'assessments' && (
                    <section className="ui-card rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Final Internship Report</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {finalReport?.submitted_at ? `PB review: ${finalReport.academic_review_status}` : 'The student has not submitted a final report yet.'}
                                </p>
                                {overallScore !== null && (
                                    <p className="mt-1 text-sm font-semibold text-primary">
                                        Overall evaluation (PB + Industry + Written Report): {overallScore.toFixed(2)}%
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={'ui-badge ' + (` text-xs font-medium ${reportReviewStatusTone(reportReviewStatus)}`)}>{reportReviewStatus}</span>
                                <Link href={route('academic-supervisor.student.final-report', student.student_id)} className="ui-button ui-button-primary rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">Review report</Link>
                            </div>
                        </div>
                    </section>
                    )}
                    {activeTab === 'confirmation' && (
                    <SectionCard
                        title="Internship Completion Decision"
                        icon={<CheckCircle2 size={20} />}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-slate-600">The PB Supervisor makes the final school decision after the Company and both supervisors submit their decisions and the report is reviewed.</p>
                            <span className={'ui-badge ' + (` text-xs font-medium ${completionStatusTone(completionStatus)}`)}>{completionStatus}</span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {completionChecklist.map((item) => (
                                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.state === 'Confirmed' || item.state === 'Submitted' || item.state === 'Approved and marked' ? 'bg-emerald-500' : item.state === 'Requirements incomplete' || item.state === 'Changes required' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                    <span className="text-slate-700">{item.label}</span>
                                    <span className={`ml-auto text-xs font-semibold ${item.state === 'Confirmed' || item.state === 'Submitted' || item.state === 'Approved and marked' ? 'text-emerald-700' : item.state === 'Requirements incomplete' || item.state === 'Changes required' ? 'text-rose-700' : 'text-amber-700'}`}>{item.state}</span>
                                </div>
                            ))}
                        </div>
                        {completionRecord && completionRecord.academic_completion_status !== 'Pending Evaluation' && !editingCompletionDecision ? (
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                                <p className="text-sm text-slate-600">
                                    Decision recorded: <span className="font-semibold text-slate-900">{completionRecord.academic_completion_status}</span>
                                    {completionRecord.academic_completion_decided_at ? ` · ${formatDate(completionRecord.academic_completion_decided_at)}` : ''}
                                </p>
                                <button type="button" onClick={() => setEditingCompletionDecision(true)} className="ui-button ui-button-outline rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Edit decision
                                </button>
                            </div>
                        ) : (
                            <div className="mt-5 border-t border-slate-100 pt-5">
                                {completionDecisionForm.errors.decision && <p className="mt-1 text-sm text-rose-600">{completionDecisionForm.errors.decision}</p>}
                                {!canFinalizeCompleted && !canFinalizeIncomplete && <p className="mb-3 text-sm text-slate-500">Final decision is available after both evaluations, the report review, and the Company confirmation are submitted.</p>}
                                {completionDecisionForm.errors.decision && <p className="mb-3 text-sm text-rose-600">{completionDecisionForm.errors.decision}</p>}
                                <div className="mt-4 flex flex-wrap justify-end gap-3">
                                    {editingCompletionDecision && (
                                        <button type="button" onClick={() => setEditingCompletionDecision(false)} className="ui-button ui-button-outline rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                            Cancel
                                        </button>
                                    )}
                                    <button type="button" disabled={!canFinalizeIncomplete || completionDecisionForm.processing} onClick={() => saveCompletionDecision('Incomplete')} className="ui-button ui-button-outline rounded-lg border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                                        Mark Incomplete
                                    </button>
                                    <button type="button" disabled={!canFinalizeCompleted || completionDecisionForm.processing} onClick={() => saveCompletionDecision('Completed')} className="ui-button ui-button-primary rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
                                        Confirm Internship Completed
                                    </button>
                                </div>
                            </div>
                        )}
                        <InternshipCompletionHistory entries={completionHistory} />
                    </SectionCard>
                    )}
                    {activeTab === 'assessments' && (
                    <SectionCard
                        title="Supervisor Evaluations"
                        icon={<ClipboardCheck size={20} />}
                    >
                        <div className="divide-y divide-slate-200">
                            <div className="pb-5">
                                {academicEvaluation ? (
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900">PB Supervisor Evaluation</h3>
                                            <p className="mt-1 text-sm text-slate-500">{academicEvaluation.reopened_at ? 'Pending correction · Previous score' : roleLabel(academicEvaluation.template_snapshot?.name ?? 'Evaluation')} · {academicEvaluation.reopened_at ? '' : 'Score '}{academicEvaluation.overall_score}%</p>
                                        </div>
                                        <Link
                                            href={route('academic-supervisor.student.evaluations.show', { student: student.student_id, submission: academicEvaluation.id })}
                                            className="ui-button ui-button-primary inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                                        >
                                            View Evaluation
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-base font-semibold text-slate-900">PB Supervisor Evaluation</h3>
                                        <p className="mt-1 text-sm text-slate-500">No evaluation submitted yet.</p>
                                    </>
                                )}
                        </div>
                        <div className="pt-5">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">Industry Supervisor Evaluation</h3>
                                    {industryEvaluation && (
                                        <p className="mt-1 text-sm text-slate-500">{industryEvaluation.reopened_at ? 'Pending correction · Previous score' : industryEvaluation.template_snapshot?.name ?? 'Industry Supervisor Evaluation'} · {industryEvaluation.reopened_at ? '' : 'Score '}{industryEvaluation.overall_score}%</p>
                                    )}
                                </div>
                                {industryEvaluation && (
                                    <Link
                                        href={route('academic-supervisor.student.evaluations.show', { student: student.student_id, submission: industryEvaluation.id })}
                                        className="ui-button ui-button-primary inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                                    >
                                        View Evaluation
                                    </Link>
                                )}
                            </div>

                        <div>
                            {!evaluation && !industryEvaluation ? (
                                <p className="text-sm text-slate-500">No evaluation submitted yet.</p>
                            ) : evaluation ? (
                                <>
                                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                        <span
                                            className={'ui-badge ' + (`inline-flex items-center gap-1.5 text-xs ${
                                                evaluation.academic_review_status === 'Completed'
                                                    ? 'ui-badge-success '
                                                    : 'ui-badge-warning '
                                            }`)}
                                        >
                                            <CheckCircle2 size={13} />
                                            {evaluation.academic_review_status}
                                        </span>

                                        {evaluation.academic_reviewed_at && (
                                            <span className="text-xs font-medium text-slate-500">
                                                Reviewed {formatDate(evaluation.academic_reviewed_at)}
                                            </span>
                                        )}

                                        {evaluation.academic_review_status !== 'Completed' && (
                                            <button
                                                type="button"
                                                onClick={markEvaluationCompleted}
                                                disabled={completing}
                                                className="ui-button ui-button-primary inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {completing ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle2 size={16} />
                                                )}
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>

                                    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <RatingDisplay label="Attendance & Punctuality" value={evaluation.attendance_punctuality} />
                                        <RatingDisplay label="Quality of Work" value={evaluation.work_quality} />
                                        <RatingDisplay label="Technical Skills" value={evaluation.technical_skills} />
                                        <RatingDisplay label="Communication Skills" value={evaluation.communication_skills} />
                                        <RatingDisplay label="Teamwork" value={evaluation.teamwork} />
                                        <RatingDisplay label="Initiative" value={evaluation.initiative} />
                                        <RatingDisplay label="Professionalism" value={evaluation.professionalism} />
                                    </div>

                                    <div className="mb-5 rounded-xl bg-blue-50 px-4 py-3">
                                        <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                            Overall Recommendation
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-blue-900">
                                            {evaluation.recommendation}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {evaluation.strengths && (
                                            <div>
                                                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Strengths
                                                </p>
                                                <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap">
                                                    {evaluation.strengths}
                                                </p>
                                            </div>
                                        )}

                                        {evaluation.areas_for_improvement && (
                                            <div>
                                                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Areas for Improvement
                                                </p>
                                                <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap">
                                                    {evaluation.areas_for_improvement}
                                                </p>
                                            </div>
                                        )}

                                        {evaluation.comments && (
                                            <div className="sm:col-span-2">
                                                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Additional Comments
                                                </p>
                                                <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap">
                                                    {evaluation.comments}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>
                            </div>
                        </div>
                    </SectionCard>
                    )}

                    {activeTab === 'overview' && <>
                    {attendance && <SectionCard title="Attendance" icon={<CalendarDays size={20} />}>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <InfoItem label="Attendance" value={attendanceLabel(attendance)} />
                            <InfoItem label="Credited days" value={attendance.credited_days} />
                            <InfoItem label="Absent days" value={attendance.absent_days} />
                            <InfoItem label="Approved recorded days" value={attendance.recorded_days} />
                            <InfoItem label="Elapsed days not logged" value={attendance.missing_days} />
                            <InfoItem label="Elapsed days in unapproved weeks" value={attendance.unapproved_days} />
                            <InfoItem label="Total internship days" value={attendance.total_days} />
                            <InfoItem label="Days actually elapsed" value={attendance.elapsed_days} />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Work days, permission/MC and public holidays count toward attendance after Industry Supervisor approval. {attendanceBasisLabel(attendance)}</p>
                    </SectionCard>}
                    {/* Basic Information */}
                    <SectionCard
                        title="Personal Information"
                        icon={<User size={20} />}
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InfoItem
                                label="Student ID"
                                value={student.pb_student_code}
                            />

                            <InfoItem
                                label="Full Name"
                                value={student.full_name}
                            />

                            <InfoItem
                                label="IC Number"
                                value={student.ic_number}
                            />

                            <InfoItem
                                label="IC Colour"
                                value={student.ic_colour}
                            />

                            <InfoItem
                                label="Date of Birth"
                                value={formatDate(student.date_of_birth)}
                                icon={<CalendarDays size={15} />}
                            />

                            <InfoItem
                                label="Place of Birth"
                                value={student.place_of_birth}
                            />

                            <InfoItem
                                label="Gender"
                                value={student.gender}
                            />

                            <InfoItem
                                label="Religion"
                                value={student.religion}
                            />

                            <InfoItem
                                label="Nationality"
                                value={student.nationality}
                            />

                            <InfoItem
                                label="Race"
                                value={student.race}
                            />

                            <InfoItem
                                label="Mobile Phone"
                                value={student.mobile_phone}
                                icon={<Phone size={15} />}
                            />

                            <InfoItem
                                label="Emergency Contact 1"
                                value={[student.emergency_contact_name, student.emergency_contact_relationship, student.emergency_no].filter(Boolean).join(' · ')}
                                icon={<Phone size={15} />}
                            />
                            <InfoItem label="Emergency Contact 2" value={[student.emergency_contact_name_2, student.emergency_contact_relationship_2, student.emergency_no_2].filter(Boolean).join(' · ')} icon={<Phone size={15} />} />
                            {student.insurance_document_path && <div><p className="mb-1 text-sm text-slate-500">Insurance document</p><a href={route('students.insurance.download', student.student_id)} className="text-sm font-medium text-primary underline">Download insurance</a></div>}

                            <div className="sm:col-span-2 lg:col-span-3">
                                <InfoItem
                                    label="Postal Address"
                                    value={student.postal_address}
                                    icon={<MapPin size={15} />}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Academic Information */}
                    <SectionCard
                        title="Academic Information"
                        icon={<GraduationCap size={20} />}
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InfoItem
                                label="Programme"
                                value={student.programme?.programme_name}
                            />

                            <InfoItem
                                label="Intake Session"
                                value={student.intake_session}
                            />

                            <InfoItem
                                label="CGPA"
                                value={student.cgpa}
                            />

                            <InfoItem
                                label="Vetting Status"
                                value={student.vetting_status}
                            />
                        </div>
                    </SectionCard>

                    {/* Internship Visits */}
                    <SectionCard
                        title="Internship Visits"
                        icon={<CalendarDays size={20} />}
                    >

                        <div className="grid gap-5 lg:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                            <div className="mb-4">
                                <h3 className="font-semibold text-slate-900">
                                    Monitoring Status
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update the monitoring status for this student's assigned class.
                                </p>
                            </div>

                            <form
                                onSubmit={submitMonitoringStatus}
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                            >
                                <div className="flex-1">
                                    <label
                                        htmlFor="monitoring_status"
                                        className="mb-1 block text-sm font-semibold text-slate-700"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="monitoring_status"
                                        value={statusData.monitoring_status}
                                        onChange={(event) =>
                                            setStatusData(
                                                'monitoring_status',
                                                event.target.value as
                                                    | 'On Track'
                                                    | 'Needs Attention'
                                                    | 'At Risk'
                                            )
                                        }
                                        className="ui-field w-full px-3 py-2"
                                    >
                                        <option value="On Track">On Track</option>
                                        <option value="Needs Attention">
                                            Needs Attention
                                        </option>
                                        <option value="At Risk">At Risk</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingStatus}
                                    className="ui-button ui-button-primary rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {updatingStatus ? 'Updating...' : 'Update Status'}
                                </button>
                            </form>
                        </div>

                        <form
                            onSubmit={submitVisit}
                            className="ui-card space-y-4 rounded-xl border border-slate-200 bg-white p-5"
                        >
                            <div className="mb-4">
                                <h3 className="font-semibold text-slate-900">Record a visit</h3>
                                <p className="mt-1 text-sm text-slate-500">This visit note is recorded for the assigned class.</p>
                            </div>
                            <div>
                                <label
                                    htmlFor="visit_date"
                                    className="mb-1 block text-sm font-semibold text-slate-700"
                                >
                                    Visit Date
                                </label>

                                <input
                                    id="visit_date"
                                    type="date"
                                    value={data.visit_date}
                                    onChange={(event) =>
                                        setData(
                                            'visit_date',
                                            event.target.value
                                        )
                                    }
                                    className="ui-field w-full px-3 py-2.5 transition"
                                    required
                                />

                                {errors.visit_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.visit_date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="notes"
                                    className="mb-1 block text-sm font-semibold text-slate-700"
                                >
                                    Visit Notes
                                </label>

                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                    rows={4}
                                    placeholder="Enter details about the internship visit..."
                                    className="ui-textarea w-full px-3 py-2.5 transition"
                                    required
                                />

                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.notes}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="ui-button ui-button-primary rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'Saving...' : 'Record Visit'}
                            </button>
                        </form>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="mb-4 font-semibold text-slate-900">
                                Visit History
                            </h3>
                            <p className="-mt-2 mb-4 text-sm text-slate-500">
                                Visit records are shared across students in this assigned class.
                            </p>

                            {visits.length > 0 ? (
                                <div className="space-y-3">
                                    {visits.map((visit) => (
                                        <div
                                            key={visit.visit_id}
                                            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                        >
                                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                                <CalendarDays
                                                    size={16}
                                                    className="text-blue-600"
                                                />

                                                {formatDate(visit.visit_date)}
                                            </div>

                                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                {visit.notes}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState text="No internship visits recorded yet." />
                            )}
                        </div>
                    </SectionCard>
                    </>}
                    </div>
                    )}
                    {activeTab === 'profile' && (
                    <div className="grid items-start gap-6 xl:grid-cols-2">
                    {/* Professional Profile */}
                    <SectionCard
                        title="Professional Profile"
                        icon={<Briefcase size={20} />}
                    >
                        {professionalProfile ? (
                            <div className="space-y-4">
                                <InfoItem
                                    label="Career Objective"
                                    value={
                                        professionalProfile.career_objective
                                    }
                                />

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Profile Summary
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                        {display(professionalProfile.summary)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <EmptyState text="No professional profile provided." />
                        )}
                    </SectionCard>

                    {/* Skills */}
                    <SectionCard
                        title="Skills"
                        icon={<Wrench size={20} />}
                    >
                        {student.skills && student.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {student.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                                    >
                                        {display(
                                            skill.skill_name ?? skill.name
                                        )}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No skills recorded." />
                        )}
                    </SectionCard>

                    {/* Soft Skills */}
                    <SectionCard
                        title="Soft Skills"
                        icon={<UserRound size={20} />}
                    >
                        {softSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {softSkills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700"
                                    >
                                        {display(
                                            skill.skill_name ?? skill.name
                                        )}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No soft skills recorded." />
                        )}
                    </SectionCard>

                    {/* Languages */}
                    <SectionCard
                        title="Languages"
                        icon={<Languages size={20} />}
                    >
                        {student.languages &&
                        student.languages.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {student.languages.map((language, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                    >
                                        <span className="font-medium text-slate-800">
                                            {display(
                                                language.language_name ??
                                                    language.name
                                            )}
                                        </span>

                                        {language.proficiency && (
                                            <span className="text-sm text-slate-500">
                                                {language.proficiency}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No languages recorded." />
                        )}
                    </SectionCard>

                    {/* Education */}
                    <SectionCard
                        title="Education"
                        icon={<GraduationCap size={20} />}
                    >
                        {student.education &&
                        student.education.length > 0 ? (
                            <div className="space-y-4">
                                {student.education.map((education, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {display(education.qualification)}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {display(education.institution)}
                                        </p>

                                        {education.field_of_study && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                {education.field_of_study}
                                            </p>
                                        )}

                                        {formatDateRange(education.start_date, education.end_date) && (
                                            <p className="mt-3 flex items-center gap-2 border-t border-slate-200/70 pt-3 text-xs font-medium text-slate-500">
                                                <CalendarDays size={14} className="text-blue-600" />
                                                {formatDateRange(education.start_date, education.end_date)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No education records found." />
                        )}
                    </SectionCard>

                    {/* Work Experience */}
                    <SectionCard
                        title="Work Experience"
                        icon={<Briefcase size={20} />}
                    >
                        {workExperiences.length > 0 ? (
                            <div className="space-y-4">
                                {workExperiences.map((experience, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {display(experience.position)}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {display(experience.company_name)}
                                        </p>

                                        {formatDateRange(experience.start_date, experience.end_date) && (
                                            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                                                <CalendarDays size={14} className="text-blue-600" />
                                                {formatDateRange(experience.start_date, experience.end_date)}
                                            </p>
                                        )}

                                        {experience.description && (
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                                                {experience.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No work experience recorded." />
                        )}
                    </SectionCard>

                    {/* Projects */}
                    <SectionCard
                        title="Projects"
                        icon={<FolderKanban size={20} />}
                    >
                        {student.projects &&
                        student.projects.length > 0 ? (
                            <div className="space-y-4">
                                {student.projects.map((project, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {display(
                                                project.project_name ??
                                                    project.title
                                            )}
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                            {display(project.description)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No projects recorded." />
                        )}
                    </SectionCard>

                    {/* Activities */}
                    <SectionCard
                        title="Activities"
                        icon={<Activity size={20} />}
                    >
                        {student.activities &&
                        student.activities.length > 0 ? (
                            <div className="space-y-3">
                                {student.activities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {display(
                                                activity.activity_name ??
                                                    activity.title
                                            )}
                                        </p>

                                        {activity.description && (
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {activity.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No activities recorded." />
                        )}
                    </SectionCard>

                    {/* Achievements */}
                    <SectionCard
                        title="Achievements"
                        icon={<Award size={20} />}
                    >
                        {student.achievements &&
                        student.achievements.length > 0 ? (
                            <div className="space-y-3">
                                {student.achievements.map(
                                    (achievement, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                        >
                                            <p className="font-semibold text-slate-900">
                                                {display(
                                                    achievement.achievement_name ??
                                                        achievement.title
                                                )}
                                            </p>

                                            {achievement.description && (
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {achievement.description}
                                                </p>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <EmptyState text="No achievements recorded." />
                        )}
                    </SectionCard>

                    {/* Referees */}
                    <SectionCard
                        title="Referees"
                        icon={<UserRound size={20} />}
                    >
                        {student.referees &&
                        student.referees.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {student.referees.map((referee, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {display(
                                                referee.full_name ??
                                                    referee.name
                                            )}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {display(referee.position)}
                                        </p>

                                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                                            <p className="flex items-center gap-2">
                                                <Mail size={14} />
                                                {display(referee.email)}
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <Phone size={14} />
                                                {display(referee.phone)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState text="No referees recorded." />
                        )}
                    </SectionCard>
                    </div>
                    )}
                </main>
            </div>
        </AuthenticatedLayout>
    );
}

function InfoItem({
    label,
    value,
    icon,
}: {
    label: string;
    value?: string | number | null;
    icon?: React.ReactNode;
}) {
    return (
        <div className="min-h-[72px] rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {icon}
                {label}
            </p>

            <p className="mt-2 break-words text-sm font-semibold leading-5 text-slate-800">
                {display(value)}
            </p>
        </div>
    );
}

function reportReviewStatusTone(status: string) {
    if (status === 'Approved') return 'ui-badge-success';
    if (status === 'Changes Required') return 'ui-badge-danger';
    if (status === 'Not Submitted') return 'ui-badge-neutral';
    return 'ui-badge-warning';
}

function completionStatusTone(status: 'Pending Evaluation' | 'Incomplete' | 'Completed') {
    if (status === 'Completed') return 'ui-badge-success';
    if (status === 'Incomplete') return 'ui-badge-danger';
    return 'ui-badge-warning';
}

function SectionCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="ui-card overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    {icon}
                </span>

                <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    {title}
                </h2>
            </div>

            {children}
        </section>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <p className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            {text}
        </p>
    );
}

function RatingDisplay({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">{label}</p>

            <div className="mt-1.5 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((score) => (
                    <Star
                        key={score}
                        size={15}
                        className={
                            score <= value
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                        }
                    />
                ))}
                <span className="ml-1.5 text-xs font-bold text-slate-600">
                    {value}/5
                </span>
            </div>
        </div>
    );
}
