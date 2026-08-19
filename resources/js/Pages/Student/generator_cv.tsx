import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

type Student = {
    student_id: number;
    pb_student_code?: string;
    full_name?: string;
    ic_number?: string;
    mobile_phone?: string;
    postal_address?: string;
    date_of_birth?: string;
    place_of_birth?: string;
    gender?: string;
    nationality?: string;
    race?: string;
    cgpa?: number | string;
    passport_photo_path?: string;

    programme?: {
        programme_id?: number;
        programme_name?: string;
    };

    user?: {
        email?: string;
    };

    professional_profile?: {
        profile?: string;
    };

    professionalProfile?: {
        profile?: string;
    };

    education?: Education[];
    work_experiences?: WorkExperience[];
    workExperiences?: WorkExperience[];
    projects?: Project[];
    activities?: Activity[];
    achievements?: Achievement[];
    referees?: Referee[];
    soft_skills?: SoftSkill[];
    softSkills?: SoftSkill[];
    skills?: Skill[];
    languages?: Language[];
};

type Education = {
    id?: number;
    institution: string;
    qualification: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
};

type WorkExperience = {
    id?: number;
    company: string;
    position: string;
    start_date?: string;
    end_date?: string;
    description?: string;
};

type Project = {
    id?: number;
    title: string;
    description?: string;
    technologies?: string;
    project_url?: string;
    start_date?: string;
    end_date?: string;
};

type Activity = {
    id?: number;
    title: string;
    description?: string;
    role?: string;
    start_date?: string;
    end_date?: string;
};

type Achievement = {
    id?: number;
    title: string;
    description?: string;
    issuer?: string;
    achievement_date?: string;
};

type Referee = {
    id?: number;
    name: string;
    position?: string;
    organization?: string;
    email?: string;
    phone?: string;
};

type SoftSkill = {
    id?: number;
    skill: string;
    description?: string;
};

type Skill = {
    skill_id?: number;
    skill_name: string;
};

type Language = {
    language_id?: number;
    language_name: string;
};

type Props = {
    student: Student;
};

function formatDate(date?: string) {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
    });
}

function hasValue(value: unknown) {
    return value !== undefined && value !== null && String(value).trim() !== '';
}

export default function GeneratorCV({ student }: Props) {
    const professionalProfile =
        student.professionalProfile?.profile ??
        student.professional_profile?.profile ??
        '';

    const education = student.education ?? [];
    const workExperiences =
        student.workExperiences ?? student.work_experiences ?? [];
    const projects = student.projects ?? [];
    const activities = student.activities ?? [];
    const achievements = student.achievements ?? [];
    const referees = student.referees ?? [];
    const softSkills = student.softSkills ?? student.soft_skills ?? [];
    const skills = student.skills ?? [];
    const languages = student.languages ?? [];

    /*
     * Required information for CV generation.
     *
     * These are the core identity/profile items plus the
     * CV sections required to produce a meaningful CV.
     */
    const missingFields: string[] = [];

    if (!hasValue(student.full_name)) {
        missingFields.push('Full Name');
    }

    if (!hasValue(student.mobile_phone)) {
        missingFields.push('Mobile Phone');
    }

    if (!hasValue(student.user?.email)) {
        missingFields.push('Email Address');
    }

    if (!hasValue(student.programme?.programme_name)) {
        missingFields.push('Academic Programme');
    }

    if (!hasValue(professionalProfile)) {
        missingFields.push('Professional Profile');
    }

    if (education.length === 0) {
        missingFields.push('At least one Education record');
    }

    if (skills.length === 0) {
        missingFields.push('At least one Technical Skill');
    }

    if (languages.length === 0) {
        missingFields.push('At least one Language');
    }

    const canGenerate = missingFields.length === 0;

    const handleDownload = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="CV Generator" />

            <div className="min-h-screen bg-gray-50 px-6 py-8">
                <div className="mx-auto max-w-6xl">

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                CV Generator
                            </h1>

                            <p className="mt-1 text-gray-600">
                                Generate your CV using the information saved in
                                your student profile.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={route('student.profile')}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                <ArrowLeft className="size-4" />
                                Back to Profile
                            </Link>

                            {canGenerate && (
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Download className="size-4" />
                                    Download / Save PDF
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Incomplete Profile */}
                    {!canGenerate && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 print:hidden">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 size-6 shrink-0 text-amber-600" />

                                <div>
                                    <h2 className="text-lg font-semibold text-amber-900">
                                        Your profile is incomplete
                                    </h2>

                                    <p className="mt-1 text-sm text-amber-800">
                                        Please complete the following information
                                        before generating your CV:
                                    </p>

                                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
                                        {missingFields.map((field) => (
                                            <li key={field}>
                                                {field}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={route('student.profile')}
                                        className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                                    >
                                        Complete My Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complete Status */}
                    {canGenerate && (
                        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 print:hidden">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="size-6 text-green-600" />

                                <div>
                                    <p className="font-semibold text-green-800">
                                        Profile Complete
                                    </p>

                                    <p className="text-sm text-green-700">
                                        Your CV is ready to be generated.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CV */}
                    {canGenerate && (
                        <div
                            id="cv-document"
                            className="mx-auto max-w-4xl bg-white px-10 py-12 shadow-lg print:max-w-none print:px-12 print:py-10 print:shadow-none"
                        >

                            {/* Personal Header */}
                            <header className="border-b-2 border-gray-900 pb-6">
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                                    <div>
                                        <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900">
                                            {student.full_name}
                                        </h1>

                                        <p className="mt-2 text-lg text-gray-600">
                                            {student.programme?.programme_name}
                                        </p>

                                        <div className="mt-4 space-y-1 text-sm text-gray-600">
                                            {hasValue(student.user?.email) && (
                                                <p>{student.user?.email}</p>
                                            )}

                                            {hasValue(student.mobile_phone) && (
                                                <p>{student.mobile_phone}</p>
                                            )}

                                            {hasValue(student.postal_address) && (
                                                <p>{student.postal_address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {hasValue(student.passport_photo_path) && (
                                        <img
                                            src={`/storage/${student.passport_photo_path}`}
                                            alt={student.full_name ?? 'Student'}
                                            className="h-32 w-28 rounded-md object-cover"
                                        />
                                    )}
                                </div>
                            </header>

                            {/* Professional Profile */}
                            <section className="mt-7">
                                <h2 className="cv-section-title">
                                    Professional Profile
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-gray-700">
                                    {professionalProfile}
                                </p>
                            </section>

                            {/* Education */}
                            <section className="mt-7">
                                <h2 className="cv-section-title">
                                    Education
                                </h2>

                                <div className="mt-4 space-y-5">
                                    {education.map((item, index) => (
                                        <div key={item.id ?? index}>
                                            <div className="flex flex-col justify-between gap-1 sm:flex-row">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {item.qualification}
                                                    </h3>

                                                    <p className="text-sm text-gray-700">
                                                        {item.institution}
                                                    </p>

                                                    {hasValue(item.field_of_study) && (
                                                        <p className="text-sm text-gray-600">
                                                            {item.field_of_study}
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-500">
                                                    {formatDate(item.start_date)}
                                                    {item.start_date && item.end_date
                                                        ? ' – '
                                                        : ''}
                                                    {formatDate(item.end_date)}
                                                </p>
                                            </div>

                                            {hasValue(item.description) && (
                                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Work Experience */}
                            {workExperiences.length > 0 && (
                                <section className="mt-7">
                                    <h2 className="cv-section-title">
                                        Work Experience
                                    </h2>

                                    <div className="mt-4 space-y-5">
                                        {workExperiences.map((item, index) => (
                                            <div key={item.id ?? index}>
                                                <div className="flex flex-col justify-between gap-1 sm:flex-row">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {item.position}
                                                        </h3>

                                                        <p className="text-sm text-gray-700">
                                                            {item.company}
                                                        </p>
                                                    </div>

                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(item.start_date)}
                                                        {item.start_date && item.end_date
                                                            ? ' – '
                                                            : ''}
                                                        {formatDate(item.end_date)}
                                                    </p>
                                                </div>

                                                {hasValue(item.description) && (
                                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Projects */}
                            {projects.length > 0 && (
                                <section className="mt-7">
                                    <h2 className="cv-section-title">
                                        Projects
                                    </h2>

                                    <div className="mt-4 space-y-5">
                                        {projects.map((item, index) => (
                                            <div key={item.id ?? index}>
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.title}
                                                </h3>

                                                {hasValue(item.technologies) && (
                                                    <p className="mt-1 text-sm font-medium text-gray-600">
                                                        Technologies: {item.technologies}
                                                    </p>
                                                )}

                                                {hasValue(item.description) && (
                                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {hasValue(item.project_url) && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {item.project_url}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Activities */}
                            {activities.length > 0 && (
                                <section className="mt-7">
                                    <h2 className="cv-section-title">
                                        Activities
                                    </h2>

                                    <div className="mt-4 space-y-4">
                                        {activities.map((item, index) => (
                                            <div key={item.id ?? index}>
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.title}
                                                </h3>

                                                {hasValue(item.role) && (
                                                    <p className="text-sm text-gray-600">
                                                        {item.role}
                                                    </p>
                                                )}

                                                {hasValue(item.description) && (
                                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Achievements */}
                            {achievements.length > 0 && (
                                <section className="mt-7">
                                    <h2 className="cv-section-title">
                                        Achievements
                                    </h2>

                                    <div className="mt-4 space-y-4">
                                        {achievements.map((item, index) => (
                                            <div key={item.id ?? index}>
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.title}
                                                </h3>

                                                {hasValue(item.issuer) && (
                                                    <p className="text-sm text-gray-600">
                                                        {item.issuer}
                                                    </p>
                                                )}

                                                {hasValue(item.description) && (
                                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Technical Skills */}
                            <section className="mt-7">
                                <h2 className="cv-section-title">
                                    Technical Skills
                                </h2>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {skills.map((skill, index) => (
                                        <span
                                            key={skill.skill_id ?? index}
                                            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-800"
                                        >
                                            {skill.skill_name}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Soft Skills */}
                            {softSkills.length > 0 && (
                                <section className="mt-7">
                                    <h2 className="cv-section-title">
                                        Soft Skills
                                    </h2>

                                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                        {softSkills.map((skill, index) => (
                                            <li
                                                key={skill.id ?? index}
                                                className="text-sm text-gray-700"
                                            >
                                                • {skill.skill}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Languages */}
                            <section className="mt-7">
                                <h2 className="cv-section-title">
                                    Languages
                                </h2>

                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                                    {languages.map((language, index) => (
                                        <span
                                            key={language.language_id ?? index}
                                            className="text-sm text-gray-700"
                                        >
                                            • {language.language_name}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Referees */}
                            {referees.length > 0 && (
                                <section className="mt-7">
                                    <h2 className="cv-section-title">
                                        Referees
                                    </h2>

                                    <div className="mt-4 grid gap-6 sm:grid-cols-2">
                                        {referees.map((referee, index) => (
                                            <div key={referee.id ?? index}>
                                                <h3 className="font-semibold text-gray-900">
                                                    {referee.name}
                                                </h3>

                                                {hasValue(referee.position) && (
                                                    <p className="text-sm text-gray-600">
                                                        {referee.position}
                                                    </p>
                                                )}

                                                {hasValue(referee.organization) && (
                                                    <p className="text-sm text-gray-600">
                                                        {referee.organization}
                                                    </p>
                                                )}

                                                {hasValue(referee.email) && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {referee.email}
                                                    </p>
                                                )}

                                                {hasValue(referee.phone) && (
                                                    <p className="text-sm text-gray-600">
                                                        {referee.phone}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>
                    )}
                </div>
            </div>

                    <style>{`
            .cv-section-title {
                border-bottom: 1px solid #d1d5db;
                padding-bottom: 6px;
                font-size: 16px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: #111827;
            }

            @media print {

                @page {
                    size: A4;
                    margin: 12mm;
                }

                /*
                * Hide the entire Student Portal interface
                * when printing.
                */
                body * {
                    visibility: hidden !important;
                }

                /*
                * Show ONLY the CV.
                */
                #cv-document,
                #cv-document * {
                    visibility: visible !important;
                }

                /*
                * Make the CV use the full printable page.
                */
                #cv-document {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;

                    width: 100% !important;
                    max-width: none !important;

                    margin: 0 !important;
                    padding: 0 !important;

                    background: white !important;
                    box-shadow: none !important;
                }

                /*
                * Prevent headings from being separated
                * from the content below them.
                */
                .cv-section-title {
                    break-after: avoid;
                    page-break-after: avoid;
                }

                /*
                * Allow sections to move naturally across
                * multiple A4 pages.
                */
                section {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                /*
                * Don't print interactive/navigation elements.
                */
                button,
                a {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `}</style>
        </AuthenticatedLayout>
    );
}