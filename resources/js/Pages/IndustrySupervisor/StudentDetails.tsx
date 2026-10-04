import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
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
    quota?: {
        quota_id: number;
        job_title: string;
    } | null;
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

export default function StudentDetails({ student, quota }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview');
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
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href={route('industry-supervisor.students')}
                                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
                            >
                                <ArrowLeft size={16} />
                                Back to My Students
                            </Link>
                            <Link
                                href={route('industry-supervisor.student.evaluate', student.student_id)}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <ClipboardCheck size={16} />
                                Evaluate Student
                            </Link>
                        </div>

                        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <UserRound size={38} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-blue-700">
                                    Industry Supervisor Portal
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                                    {student.full_name}
                                </h1>

                                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                                    <span>
                                        {student.pb_student_code}
                                    </span>

                                    {student.programme?.programme_name && (
                                        <span>
                                            {student.programme.programme_name}
                                        </span>
                                    )}

                                    {student.intake_session && (
                                        <span>
                                            {student.intake_session}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {quota?.job_title && (
                            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-800">
                                <Briefcase size={15} />
                                Supervising position: {quota.job_title}
                            </div>
                        )}
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

                    {activeTab === 'overview' && (
                    <div className="space-y-6">
                    {/* Basic Information */}
                    <section className="mb-6">
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
                    <section className="mb-6">
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
                    </section>

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
