import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeft,
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
    monitoringStatus: 'On Track' | 'Needs Attention' | 'At Risk';
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

export default function StudentDetails({ student, visits, evaluation, monitoringStatus, }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview');
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

    const markEvaluationCompleted = () => {
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
                        <Link
                            href={route('academic-supervisor.students')}
                            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
                        >
                            <ArrowLeft size={16} />
                            Back to My Students
                        </Link>

                        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-7 shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
                            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[40px] border-white/[0.04]" />
                            <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

                            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-inner backdrop-blur-sm">
                                    <UserRound size={36} strokeWidth={1.6} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                                        Academic Supervisor · Student Record
                                    </p>

                                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        {student.full_name}
                                    </h1>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                                            <User size={14} className="text-blue-200" />
                                            {student.pb_student_code}
                                        </span>

                                        {student.programme?.programme_name && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                                                <GraduationCap size={14} className="text-blue-200" />
                                                {student.programme.programme_name}
                                            </span>
                                        )}

                                        {student.intake_session && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                                                <CalendarDays size={14} className="text-blue-200" />
                                                {student.intake_session}
                                            </span>
                                        )}

                                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${monitoringTone}`}>
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
                    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            Background &amp; Skills
                        </button>
                    </div>

                    {activeTab === 'overview' ? (
                    <div className="space-y-6">
                    {/* Industry Supervisor Evaluation */}
                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <ClipboardCheck size={20} className="text-blue-600" />

                            <h2 className="text-lg font-bold text-slate-900">
                                Industry Supervisor Evaluation
                            </h2>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            {!evaluation ? (
                                <EmptyState text="The industry supervisor has not submitted an evaluation for this student yet." />
                            ) : (
                                <>
                                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                                evaluation.academic_review_status === 'Completed'
                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                                            }`}
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
                                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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
                            )}
                        </div>
                    </section>

                    {/* Basic Information */}
                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <User size={20} className="text-blue-600" />

                            <h2 className="text-lg font-bold text-slate-900">
                                Personal Information
                            </h2>
                        </div>

                        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
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
                                label="Emergency Contact"
                                value={student.emergency_no}
                                icon={<Phone size={15} />}
                            />

                            <div className="sm:col-span-2 lg:col-span-3">
                                <InfoItem
                                    label="Postal Address"
                                    value={student.postal_address}
                                    icon={<MapPin size={15} />}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Academic Information */}
                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <GraduationCap
                                size={20}
                                className="text-blue-600"
                            />

                            <h2 className="text-lg font-bold text-slate-900">
                                Academic Information
                            </h2>
                        </div>

                        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
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
                    </section>

                    {/* Internship Visits */}
                    <SectionCard
                        title="Internship Visits"
                        icon={<CalendarDays size={20} />}
                    >

                        <div className="grid gap-5 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
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
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {updatingStatus ? 'Updating...' : 'Update Status'}
                                </button>
                            </form>
                        </div>

                        <form
                            onSubmit={submitVisit}
                            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
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
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
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
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
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
                                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                    </div>
                    ) : (
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
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    {icon}
                </span>

                <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
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
