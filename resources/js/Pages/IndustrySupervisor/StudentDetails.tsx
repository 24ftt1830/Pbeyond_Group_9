import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmAction } from '@/lib/confirm-action';
import BackButton from '@/Components/BackButton';
import LogbookCorrectionNotice, { type PendingLogbookCorrection } from '@/Components/LogbookCorrectionNotice';
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
    hasActiveEvaluationTemplate: boolean;
    completionRecord: {
        industry_confirmation_status: 'Pending Confirmation' | 'Confirmed' | 'Changes Required';
        industry_confirmed_at?: string | null;
        academic_completion_status: 'Pending Evaluation' | 'Completed' | 'Incomplete';
    } | null;
    legacyEvaluation: {
        attendance_punctuality: number;
        work_quality: number;
        technical_skills: number;
        communication_skills: number;
        teamwork: number;
        initiative: number;
        professionalism: number;
        recommendation: string;
        comments?: string | null;
    } | null;
    evaluationSubmission: {
        id: number;
        reopened_at?: string | null;
        overall_score: number | string;
        template_snapshot: { name?: string; version?: number };
        answers: Record<string, { section: string; criterion: string; level: string; points: number }>;
        comments?: string | null;
    } | null;
    quota?: {
        quota_id: number;
        job_title: string;
    } | null;
    completionStatus: 'Pending Evaluation' | 'Incomplete' | 'Completed';
    pendingLogbookCorrections?: PendingLogbookCorrection[];
    overallScore: number | null;
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

    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
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

export default function StudentDetails({ student, quota, evaluationSubmission, legacyEvaluation, completionRecord, hasActiveEvaluationTemplate, completionStatus, overallScore, pendingLogbookCorrections = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'evaluation' | 'confirmation'>('overview');
    const confirmationLocked = completionRecord?.academic_completion_status === 'Completed';
    const [editingConfirmation, setEditingConfirmation] = useState(
        !completionRecord || (!confirmationLocked && completionRecord.industry_confirmation_status === 'Pending Confirmation')
    );
    const confirmationForm = useForm<{
        status: 'Confirmed' | 'Changes Required';
    }>({
        status: completionRecord?.industry_confirmation_status === 'Changes Required' ? 'Changes Required' : 'Confirmed',
    });

    const saveCompanyConfirmation = async (status: 'Confirmed' | 'Changes Required') => {
        if (confirmationForm.processing) return;
        const confirmed = status === 'Confirmed';
        if (!(await confirmAction(confirmed
            ? `Confirm that ${student.full_name} has completed the company's internship requirements? PB Supervisor will make the final school decision.`
            : `Mark ${student.full_name}'s company internship requirements as incomplete?`, {
            title: confirmed ? 'Confirm company completion?' : 'Mark requirements incomplete?',
            confirmLabel: confirmed ? 'Confirm completion' : 'Mark incomplete',
            destructive: !confirmed,
        }))) return;
        confirmationForm.transform((data) => ({ ...data, status }));
        confirmationForm.put(route('industry-supervisor.student.completion-confirmation.update', student.student_id), {
            preserveScroll: true,
            onSuccess: () => setEditingConfirmation(false),
            onError: () => setEditingConfirmation(false),
            onFinish: () => confirmationForm.transform((data) => data),
        });
    };
    const professionalProfile =
        student.professionalProfile ?? student.professional_profile;

    const softSkills =
        student.softSkills ?? student.soft_skills ?? [];

    const workExperiences =
        student.workExperiences ?? student.work_experiences ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={`${student.full_name} - Student Details`} />

            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <header className="bg-slate-50">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <BackButton
                                href={route('industry-supervisor.students')}
                            >
                                Back to My Students
                            </BackButton>
                            <div className="flex flex-wrap gap-2">{hasActiveEvaluationTemplate || evaluationSubmission ? <Link
                                href={route('industry-supervisor.student.evaluate', student.student_id)}
                                className="ui-button ui-button-primary inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                            >
                                <ClipboardCheck size={16} />
                                {evaluationSubmission?.reopened_at ? 'Revise Evaluation' : evaluationSubmission ? 'View Evaluation' : 'Evaluate Student'}
                            </Link> : <button type="button" disabled title="The Admin has not activated an Industry Supervisor evaluation template yet." className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500">
                                <ClipboardCheck size={16} />
                                Evaluation unavailable
                            </button>}</div>
                        </div>

                        <div className="ui-card mt-6 border-blue-100 bg-blue-50/40 p-6">



                            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-900 ">
                                    <UserRound size={36} strokeWidth={1.6} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                        Industry Supervisor · Student Record
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
                                        <span className={'ui-badge ' + (`inline-flex items-center gap-2 border text-xs ${completionStatus === 'Completed' ? 'ui-badge-success ' : completionStatus === 'Incomplete' ? 'ui-badge-danger ' : 'ui-badge-warning '}`)}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            {completionStatus}
                                        </span>
                                        {overallScore !== null && (
                                            <span className="ui-badge inline-flex items-center gap-2 border border-blue-100 bg-white text-xs text-slate-600">
                                                Overall score: {overallScore}%
                                            </span>
                                        )}
                                    </div>

                                    {quota?.job_title && (
                                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-sm font-semibold text-primary">
                                            <Briefcase size={15} />
                                            Internship position: {quota.job_title}
                                        </div>
                                    )}
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
                            onClick={() => setActiveTab('evaluation')}
                            className={'ui-tab ' + (`flex min-h-10 w-full items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-semibold leading-5 transition ${activeTab === 'evaluation' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`)}
                        >
                            Evaluation
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
                    {activeTab === 'evaluation' && (
                    <SectionCard
                        title="Industry Supervisor Evaluation"
                        icon={<ClipboardCheck size={20} />}
                        action={evaluationSubmission && (
                            <Link
                                href={route('industry-supervisor.student.evaluations.show', { student: student.student_id, submission: evaluationSubmission.id })}
                                className="ui-button ui-button-primary inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                            >
                                View Evaluation
                            </Link>
                        )}
                    >
                        {evaluationSubmission ? (
                            <p className="text-sm text-slate-500">{evaluationSubmission.reopened_at ? 'Pending correction · Previous score' : evaluationSubmission.template_snapshot?.name ?? 'Industry Supervisor Evaluation'} · {evaluationSubmission.reopened_at ? '' : 'Score '}{evaluationSubmission.overall_score}%</p>
                        ) : legacyEvaluation ? (
                            <details>
                                <summary className="inline-flex cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-blue-50 [&::-webkit-details-marker]:hidden">View Earlier Evaluation</summary>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <InfoItem label="Attendance & punctuality" value={legacyEvaluation.attendance_punctuality} />
                                    <InfoItem label="Quality of work" value={legacyEvaluation.work_quality} />
                                    <InfoItem label="Technical skills" value={legacyEvaluation.technical_skills} />
                                    <InfoItem label="Communication" value={legacyEvaluation.communication_skills} />
                                    <InfoItem label="Teamwork" value={legacyEvaluation.teamwork} />
                                    <InfoItem label="Initiative" value={legacyEvaluation.initiative} />
                                    <InfoItem label="Professionalism" value={legacyEvaluation.professionalism} />
                                    <InfoItem label="Recommendation" value={legacyEvaluation.recommendation} />
                                </div>
                                {legacyEvaluation.comments && <p className="mt-4 text-sm leading-6 text-slate-600">{legacyEvaluation.comments}</p>}
                            </details>
                        ) : (
                            <p className="text-sm text-slate-500">No evaluation submitted yet.</p>
                        )}
                    </SectionCard>
                    )}
                    {activeTab === 'confirmation' && (
                    <SectionCard
                        title="Company Internship Confirmation"
                        icon={<Briefcase size={20} />}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-slate-600">Confirm whether the student has completed their internship requirements at the company. This is separate from the written report review.</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={'ui-badge ' + (` text-xs font-medium ${confirmationTone(completionRecord?.industry_confirmation_status ?? 'Pending Confirmation')}`)}>
                                    {confirmationLabel(completionRecord?.industry_confirmation_status ?? 'Pending Confirmation')}
                                </span>
                                {completionRecord && completionRecord.industry_confirmation_status !== 'Pending Confirmation' && (!editingConfirmation || confirmationLocked) && (
                                    <button
                                        type="button"
                                        disabled={confirmationLocked}
                                        title={confirmationLocked ? 'Locked after final internship completion was confirmed.' : undefined}
                                        onClick={() => setEditingConfirmation(true)}
                                        className="ui-button ui-button-outline rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                                    >
                                        Edit confirmation
                                    </button>
                                )}
                            </div>
                        </div>
                        {confirmationForm.errors.status && <p className="mt-3 text-sm text-rose-600">{confirmationForm.errors.status}</p>}
                        {confirmationLocked ? (
                            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">This confirmation is locked because final internship completion has been confirmed.</p>
                        ) : editingConfirmation ? (
                            <>
                                <div className="mt-4 flex flex-wrap justify-end gap-3">
                                    {completionRecord && completionRecord.industry_confirmation_status !== 'Pending Confirmation' && (
                                        <button type="button" onClick={() => setEditingConfirmation(false)} className="ui-button ui-button-outline rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                            Cancel
                                        </button>
                                    )}
                                    <button type="button" disabled={confirmationForm.processing} onClick={() => saveCompanyConfirmation('Changes Required')} className="ui-button ui-button-outline rounded-lg border border-amber-300 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60">
                                        Mark requirements incomplete
                                    </button>
                                    <button type="button" disabled={confirmationForm.processing} onClick={() => saveCompanyConfirmation('Confirmed')} className="ui-button ui-button-primary rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
                                        Confirm company completion
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="mt-4 text-sm text-slate-500">Company confirmation is saved. Select Edit confirmation to change it.</p>
                        )}
                    </SectionCard>
                    )}
                    {activeTab === 'overview' && <>
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
                                value={
                                    student.programme?.programme_name
                                }
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

                    </>}
                    </div>
                    )}

                    {activeTab === 'profile' && (
                    <div className="grid gap-6 lg:grid-cols-2">
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
                                        {display(
                                            professionalProfile.summary
                                        )}
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
                                            {display(
                                                education.qualification
                                            )}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {display(
                                                education.institution
                                            )}
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
                                            {display(
                                                experience.position
                                            )}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {display(
                                                experience.company_name
                                            )}
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
                                                    {
                                                        achievement.description
                                                    }
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

function SectionCard({
    title,
    icon,
    children,
    action,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <section className="ui-card overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    {icon}
                </span>

                <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    {title}
                </h2>
                </div>
                {action}
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

function confirmationLabel(status: 'Pending Confirmation' | 'Confirmed' | 'Changes Required') {
    if (status === 'Confirmed') return 'Confirmed at company';
    if (status === 'Changes Required') return 'Company requirements incomplete';
    return 'Awaiting company confirmation';
}

function confirmationTone(status: 'Pending Confirmation' | 'Confirmed' | 'Changes Required') {
    if (status === 'Confirmed') return 'ui-badge-success';
    if (status === 'Changes Required') return 'ui-badge-danger';
    return 'ui-badge-warning';
}
