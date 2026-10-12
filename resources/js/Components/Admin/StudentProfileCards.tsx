import type { ReactNode } from 'react';
import { User, UserRound, Mail, GraduationCap, Phone, MapPin, CalendarDays, Briefcase, Award, Languages, Wrench, FolderKanban, Activity, Star } from 'lucide-react';
import { SectionCard, InfoItem, EmptyState, display, formatDate, formatDateRange } from './RecordView';

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

export interface StudentProfile {
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

export default function StudentProfileCards({ student, tab, action }: { student: StudentProfile; tab: 'overview' | 'profile'; action?: ReactNode }) {
    const professionalProfile = student.professional_profile ?? student.professionalProfile;
    const softSkills = student.soft_skills ?? student.softSkills ?? [];
    const workExperiences = student.work_experiences ?? student.workExperiences ?? [];
    return tab === 'overview' ? <div className="space-y-6">
                    {/* Basic Information */}
                    <SectionCard
                        title="Personal Information"
                        action={action}
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

    </div> : <div className="grid items-start gap-6 xl:grid-cols-2">
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
    </div>;
}
