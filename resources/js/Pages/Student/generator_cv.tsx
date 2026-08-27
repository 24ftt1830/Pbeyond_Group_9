import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    AlertCircle,
    CheckCircle2,
    UserRound,
    Settings,
    MessageCircle,
    UsersRound,
    GraduationCap,
    BriefcaseBusiness,
    Lightbulb,
    Trophy,
    Phone,
    Mail,
    MapPin,
} from 'lucide-react';

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


/* ============================================================
   HELPERS
============================================================ */

function hasValue(value: unknown) {
    return (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
    );
}

function formatMonthYear(date?: string) {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
    });
}

function formatYear(date?: string) {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-GB', {
        year: 'numeric',
    });
}

function splitDescription(description?: string) {
    if (!description) return [];

    return description
        .replace(/<br\s*\/?>/gi, '\n')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
}


/* ============================================================
   COMPONENT
============================================================ */

export default function GeneratorCV({ student }: Props) {

    const professionalProfile =
        student.professionalProfile?.profile ??
        student.professional_profile?.profile ??
        '';

    const education = student.education ?? [];

    const workExperiences =
        student.workExperiences ??
        student.work_experiences ??
        [];

    const projects = student.projects ?? [];
    const activities = student.activities ?? [];
    const achievements = student.achievements ?? [];
    const referees = student.referees ?? [];

    const softSkills =
        student.softSkills ??
        student.soft_skills ??
        [];

    const skills = student.skills ?? [];
    const languages = student.languages ?? [];


    /* ============================================================
       REQUIRED INFORMATION
    ============================================================ */

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

            <div className="cv-page min-h-screen bg-slate-100 px-6 py-8">


                {/* ========================================================
                    GENERATOR HEADER
                ========================================================= */}

                <div className="mx-auto mb-6 max-w-6xl print:hidden">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                           <h1>Student CV</h1>

                            <p>
                                Applicant CV and profile information.
                            </p>
                        </div>

                        <div className="flex gap-3">

                            <Link
                                href={route('student.profile')}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <ArrowLeft className="size-4" />
                                Back to Profile
                            </Link>

                            {canGenerate && (
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <Download className="size-4" />
                                    Download / Save PDF
                                </button>
                            )}

                        </div>

                    </div>


                    {/* INCOMPLETE */}

                    {!canGenerate && (

                        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">

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


                    {/* COMPLETE */}

                    {canGenerate && (

                        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">

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

                </div>


                {/* ========================================================
                    CV
                ========================================================= */}

                {canGenerate && (

                    <div
                        id="cv-document"
                        className="cv-document mx-auto"
                    >

                        <div className="cv-layout">


                            {/* ==================================================
                                LEFT BLUE SIDEBAR
                            ================================================== */}

                            <aside className="cv-sidebar">


                                {/* PHOTO */}

                                <div className="cv-photo-wrapper">

                                    {hasValue(
                                        student.passport_photo_path
                                    ) ? (

                                        <img
                                            src={`/storage/${student.passport_photo_path}`}
                                            alt={student.full_name ?? 'Student'}
                                            className="cv-photo"
                                        />

                                    ) : (

                                        <div className="cv-photo cv-photo-empty" />

                                    )}

                                </div>


                                {/* PROFESSIONAL PROFILE */}

                                <div className="cv-sidebar-section">

                                    <div className="cv-sidebar-heading">

                                        <UserRound />

                                        <h2>
                                            Professional Profile
                                        </h2>

                                    </div>

                                    <div className="cv-gold-line" />

                                    <p className="cv-profile">
                                        {professionalProfile}
                                    </p>

                                </div>


                                {/* SKILLS */}

                                {(skills.length > 0 ||
                                    softSkills.length > 0) && (

                                    <div className="cv-sidebar-section">

                                        <div className="cv-sidebar-heading">

                                            <Settings />

                                            <h2>
                                                Skills
                                            </h2>

                                        </div>

                                        <div className="cv-gold-line" />


                                        {skills.length > 0 && (

                                            <div className="cv-skill-group">

                                                <h3>
                                                    Technical Skills
                                                </h3>

                                                <ul>

                                                    {skills.map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (

                                                            <li
                                                                key={
                                                                    skill.skill_id ??
                                                                    index
                                                                }
                                                            >
                                                                {skill.skill_name}
                                                            </li>

                                                        )
                                                    )}

                                                </ul>

                                            </div>

                                        )}


                                        {softSkills.length > 0 && (

                                            <div className="cv-skill-group">

                                                <h3>
                                                    Soft Skills
                                                </h3>

                                                <ul>

                                                    {softSkills.map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (

                                                            <li
                                                                key={
                                                                    skill.id ??
                                                                    index
                                                                }
                                                            >
                                                                {skill.skill}
                                                            </li>

                                                        )
                                                    )}

                                                </ul>

                                            </div>

                                        )}

                                    </div>

                                )}


                                {/* LANGUAGES */}

                                {languages.length > 0 && (

                                    <div className="cv-sidebar-section">

                                        <div className="cv-sidebar-heading">

                                            <MessageCircle />

                                            <h2>
                                                Languages
                                            </h2>

                                        </div>

                                        <div className="cv-gold-line" />

                                        <ul className="cv-sidebar-list">

                                            {languages.map(
                                                (
                                                    language,
                                                    index
                                                ) => (

                                                    <li
                                                        key={
                                                            language.language_id ??
                                                            index
                                                        }
                                                    >
                                                        {language.language_name}
                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>

                                )}


                                {/* REFERENCES */}

                                {referees.length > 0 && (

                                    <div className="cv-sidebar-section">

                                        <div className="cv-sidebar-heading">

                                            <UsersRound />

                                            <h2>
                                                References
                                            </h2>

                                        </div>

                                        <div className="cv-gold-line" />

                                        {referees.map(
                                            (
                                                referee,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        referee.id ??
                                                        index
                                                    }
                                                    className="cv-reference"
                                                >

                                                    <strong>
                                                        {referee.name}
                                                    </strong>

                                                    {hasValue(
                                                        referee.position
                                                    ) && (
                                                        <span>
                                                            {
                                                                referee.position
                                                            }
                                                        </span>
                                                    )}

                                                    {hasValue(
                                                        referee.organization
                                                    ) && (
                                                        <span>
                                                            {
                                                                referee.organization
                                                            }
                                                        </span>
                                                    )}

                                                    {hasValue(
                                                        referee.email
                                                    ) && (
                                                        <span>
                                                            {
                                                                referee.email
                                                            }
                                                        </span>
                                                    )}

                                                    {hasValue(
                                                        referee.phone
                                                    ) && (
                                                        <span>
                                                            {
                                                                referee.phone
                                                            }
                                                        </span>
                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}


                                {/* ==================================================
                                    BOTTOM-RIGHT CORNER DECORATION

                                    This is intentionally anchored to:
                                    right: 0
                                    bottom: 0

                                    It therefore sits on the actual bottom-right
                                    corner of the blue sidebar.
                                ================================================== */}

                                <div className="cv-corner-decoration">

                                    <div className="cv-corner-gold" />

                                    <div className="cv-corner-navy-line" />

                                    <div className="cv-corner-gold-line" />

                                </div>

                            </aside>


                            {/* ==================================================
                                RIGHT MAIN CONTENT
                            ================================================== */}

                            <main className="cv-main">


                                {/* HEADER */}

                                <header className="cv-header">

                                    <h1>
                                        {student.full_name}
                                    </h1>

                                    <div className="cv-name-rule">

                                        <div className="cv-name-rule-gold" />

                                    </div>


                                    {/* CONTACT */}

                                    <div className="cv-contact">

                                        {hasValue(
                                            student.mobile_phone
                                        ) && (

                                            <div className="cv-contact-item">

                                                <Phone />

                                                <span>
                                                    {
                                                        student.mobile_phone
                                                    }
                                                </span>

                                            </div>

                                        )}


                                        {hasValue(
                                            student.user?.email
                                        ) && (

                                            <div className="cv-contact-item">

                                                <Mail />

                                                <span>
                                                    {
                                                        student.user?.email
                                                    }
                                                </span>

                                            </div>

                                        )}


                                        {hasValue(
                                            student.postal_address
                                        ) && (

                                            <div className="cv-contact-item">

                                                <MapPin />

                                                <span>
                                                    {
                                                        student.postal_address
                                                    }
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                </header>


                                {/* ==================================================
                                    EDUCATION
                                ================================================== */}

                                {education.length > 0 && (

                                    <section className="cv-section">

                                        <div className="cv-section-title">

                                            <div className="cv-section-icon">
                                                <GraduationCap />
                                            </div>

                                            <h2>
                                                Education
                                            </h2>

                                            <div className="cv-section-rule" />

                                        </div>


                                        {education.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                    className="cv-entry"
                                                >

                                                    <div className="cv-entry-heading">

                                                        <div>

                                                            <h3>
                                                                {
                                                                    item.institution
                                                                }
                                                            </h3>

                                                            <p className="cv-entry-subtitle">
                                                                {
                                                                    item.qualification
                                                                }

                                                                {hasValue(
                                                                    item.field_of_study
                                                                ) &&
                                                                    ` in ${item.field_of_study}`}
                                                            </p>

                                                        </div>

                                                        <div className="cv-date">

                                                            {hasValue(
                                                                item.start_date
                                                            ) &&
                                                                formatYear(
                                                                    item.start_date
                                                                )}

                                                            {item.start_date &&
                                                            item.end_date
                                                                ? ' – '
                                                                : ''}

                                                            {hasValue(
                                                                item.end_date
                                                            ) &&
                                                                formatYear(
                                                                    item.end_date
                                                                )}

                                                        </div>

                                                    </div>


                                                    {hasValue(
                                                        item.description
                                                    ) && (

                                                        <ul className="cv-bullets">

                                                            {splitDescription(
                                                                item.description
                                                            ).map(
                                                                (
                                                                    bullet,
                                                                    bulletIndex
                                                                ) => (

                                                                    <li
                                                                        key={
                                                                            bulletIndex
                                                                        }
                                                                    >
                                                                        {
                                                                            bullet
                                                                        }
                                                                    </li>

                                                                )
                                                            )}

                                                        </ul>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </section>

                                )}


                                {/* ==================================================
                                    INDUSTRY ATTACHMENT
                                ================================================== */}

                                {workExperiences.length > 0 && (

                                    <section className="cv-section">

                                        <div className="cv-section-title">

                                            <div className="cv-section-icon">
                                                <BriefcaseBusiness />
                                            </div>

                                            <h2>
                                                Industry Attachment
                                            </h2>

                                            <div className="cv-section-rule" />

                                        </div>


                                        {workExperiences.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                    className="cv-entry"
                                                >

                                                    <div className="cv-entry-heading">

                                                        <div>

                                                            <h3>
                                                                {
                                                                    item.company
                                                                }
                                                            </h3>

                                                            <p className="cv-entry-subtitle">
                                                                {
                                                                    item.position
                                                                }
                                                            </p>

                                                        </div>

                                                        <div className="cv-date">

                                                            {formatMonthYear(
                                                                item.start_date
                                                            )}

                                                            {item.start_date &&
                                                            item.end_date
                                                                ? ' – '
                                                                : ''}

                                                            {item.end_date
                                                                ? formatMonthYear(
                                                                      item.end_date
                                                                  )
                                                                : item.start_date
                                                                  ? 'Present'
                                                                  : ''}

                                                        </div>

                                                    </div>


                                                    {hasValue(
                                                        item.description
                                                    ) && (

                                                        <ul className="cv-bullets">

                                                            {splitDescription(
                                                                item.description
                                                            ).map(
                                                                (
                                                                    bullet,
                                                                    bulletIndex
                                                                ) => (

                                                                    <li
                                                                        key={
                                                                            bulletIndex
                                                                        }
                                                                    >
                                                                        {
                                                                            bullet
                                                                        }
                                                                    </li>

                                                                )
                                                            )}

                                                        </ul>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </section>

                                )}


                                {/* ==================================================
                                    FINAL YEAR PROJECT
                                ================================================== */}

                                {projects.length > 0 && (

                                    <section className="cv-section">

                                        <div className="cv-section-title">

                                            <div className="cv-section-icon">
                                                <Lightbulb />
                                            </div>

                                            <h2>
                                                Final Year Project
                                            </h2>

                                            <div className="cv-section-rule" />

                                        </div>


                                        {projects.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                    className="cv-entry"
                                                >

                                                    <div className="cv-entry-heading">

                                                        <div>

                                                            <h3>
                                                                {
                                                                    item.title
                                                                }
                                                            </h3>

                                                            {hasValue(
                                                                item.technologies
                                                            ) && (

                                                                <p className="cv-entry-subtitle">
                                                                    {
                                                                        item.technologies
                                                                    }
                                                                </p>

                                                            )}

                                                        </div>

                                                        <div className="cv-date">

                                                            {hasValue(
                                                                item.end_date
                                                            )
                                                                ? formatYear(
                                                                      item.end_date
                                                                  )
                                                                : hasValue(
                                                                      item.start_date
                                                                  )
                                                                  ? formatYear(
                                                                        item.start_date
                                                                    )
                                                                  : ''}

                                                        </div>

                                                    </div>


                                                    {hasValue(
                                                        item.description
                                                    ) && (

                                                        <ul className="cv-bullets">

                                                            {splitDescription(
                                                                item.description
                                                            ).map(
                                                                (
                                                                    bullet,
                                                                    bulletIndex
                                                                ) => (

                                                                    <li
                                                                        key={
                                                                            bulletIndex
                                                                        }
                                                                    >
                                                                        {
                                                                            bullet
                                                                        }
                                                                    </li>

                                                                )
                                                            )}

                                                        </ul>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </section>

                                )}


                                {/* ==================================================
                                    LEADERSHIP
                                ================================================== */}

                                {activities.length > 0 && (

                                    <section className="cv-section">

                                        <div className="cv-section-title">

                                            <div className="cv-section-icon">
                                                <UsersRound />
                                            </div>

                                            <h2>
                                                Leadership & Co-Curricular Activities
                                            </h2>

                                            <div className="cv-section-rule" />

                                        </div>


                                        {activities.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                    className="cv-entry"
                                                >

                                                    <div className="cv-entry-heading">

                                                        <div>

                                                            <h3>
                                                                {
                                                                    item.title
                                                                }
                                                            </h3>

                                                            {hasValue(
                                                                item.role
                                                            ) && (

                                                                <p className="cv-entry-subtitle">
                                                                    {
                                                                        item.role
                                                                    }
                                                                </p>

                                                            )}

                                                        </div>

                                                        <div className="cv-date">

                                                            {item.start_date &&
                                                                formatMonthYear(
                                                                    item.start_date
                                                                )}

                                                            {item.start_date &&
                                                            item.end_date
                                                                ? ' – '
                                                                : ''}

                                                            {item.end_date
                                                                ? formatMonthYear(
                                                                      item.end_date
                                                                  )
                                                                : item.start_date
                                                                  ? 'Present'
                                                                  : ''}

                                                        </div>

                                                    </div>


                                                    {hasValue(
                                                        item.description
                                                    ) && (

                                                        <ul className="cv-bullets">

                                                            {splitDescription(
                                                                item.description
                                                            ).map(
                                                                (
                                                                    bullet,
                                                                    bulletIndex
                                                                ) => (

                                                                    <li
                                                                        key={
                                                                            bulletIndex
                                                                        }
                                                                    >
                                                                        {
                                                                            bullet
                                                                        }
                                                                    </li>

                                                                )
                                                            )}

                                                        </ul>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </section>

                                )}


                                {/* ==================================================
                                    ACHIEVEMENTS
                                ================================================== */}

                                {achievements.length > 0 && (

                                    <section className="cv-section">

                                        <div className="cv-section-title">

                                            <div className="cv-section-icon">
                                                <Trophy />
                                            </div>

                                            <h2>
                                                Achievements
                                            </h2>

                                            <div className="cv-section-rule" />

                                        </div>


                                        {achievements.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        item.id ??
                                                        index
                                                    }
                                                    className="cv-entry"
                                                >

                                                    <div className="cv-entry-heading">

                                                        <div>

                                                            <h3>
                                                                {
                                                                    item.title
                                                                }
                                                            </h3>

                                                            {hasValue(
                                                                item.issuer
                                                            ) && (

                                                                <p className="cv-entry-subtitle">
                                                                    {
                                                                        item.issuer
                                                                    }
                                                                </p>

                                                            )}

                                                        </div>

                                                        <div className="cv-date">

                                                            {hasValue(
                                                                item.achievement_date
                                                            ) &&
                                                                formatYear(
                                                                    item.achievement_date
                                                                )}

                                                        </div>

                                                    </div>


                                                    {hasValue(
                                                        item.description
                                                    ) && (

                                                        <ul className="cv-bullets">

                                                            {splitDescription(
                                                                item.description
                                                            ).map(
                                                                (
                                                                    bullet,
                                                                    bulletIndex
                                                                ) => (

                                                                    <li
                                                                        key={
                                                                            bulletIndex
                                                                        }
                                                                    >
                                                                        {
                                                                            bullet
                                                                        }
                                                                    </li>

                                                                )
                                                            )}

                                                        </ul>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </section>

                                )}

                            </main>

                        </div>

                    </div>

                )}

            </div>


            {/* ================================================================
                CV DESIGN
            ================================================================= */}

            <style>{`

                /* ============================================================
                   DESIGN SYSTEM
                ============================================================ */

                .cv-document {

                    --navy: #062d5f;
                    --navy-dark: #05264f;

                    --gold: #f2c33b;

                    --ink: #17243a;
                    --text: #242b35;
                    --muted: #505862;

                    --rule: #183a64;

                    /*
                     * Arial is intentionally used here.
                     * It is cleaner and safer for a printed CV than a
                     * decorative/display font.
                     */

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                }


                /* ============================================================
                   A4 DOCUMENT
                ============================================================ */

                .cv-document {

                    width: 210mm;

                    min-height: 297mm;

                    margin: 0 auto;

                    background: #ffffff;

                    overflow: hidden;

                    box-shadow:
                        0 10px 30px rgba(15, 23, 42, 0.16);

                }


                .cv-layout {

                    display: grid;

                    grid-template-columns:
                        61mm
                        149mm;

                    min-height: 297mm;

                }


                /* ============================================================
                   BLUE SIDEBAR
                ============================================================ */

                .cv-sidebar {

                    position: relative;

                    min-height: 297mm;

                    overflow: hidden;

                    padding:
                        7.5mm
                        6.5mm
                        10mm;

                    background:
                        var(--navy);

                    color: #ffffff;

                }


                /* ============================================================
                   PHOTO
                ============================================================ */

                .cv-photo-wrapper {

                    display: flex;

                    justify-content: center;

                    margin-bottom: 6.5mm;

                }


                .cv-photo {

                    width: 45mm;

                    height: 50mm;

                    object-fit: cover;

                    display: block;

                    border:
                        0.45mm
                        solid
                        rgba(255,255,255,0.85);

                    background: white;

                }


                .cv-photo-empty {

                    background: #ffffff;

                }


                /* ============================================================
                   SIDEBAR SECTION
                ============================================================ */

                .cv-sidebar-section {

                    position: relative;

                    z-index: 4;

                    margin-bottom: 5.5mm;

                }


                .cv-sidebar-heading {

                    display: flex;

                    align-items: center;

                    gap: 2.2mm;

                }


                .cv-sidebar-heading svg {

                    width: 4.1mm;

                    height: 4.1mm;

                    flex-shrink: 0;

                    color: var(--gold);

                    stroke-width: 2;

                }


                .cv-sidebar-heading h2 {

                    margin: 0;

                    color: #ffffff;

                    font-size: 9.2pt;

                    line-height: 1.1;

                    font-weight: 700;

                    text-transform: uppercase;

                    letter-spacing: 0.01em;

                }


                /*
                 * Thin gold divider.
                 */

                .cv-gold-line {

                    width: 100%;

                    height: 0.38mm;

                    margin-top: 1.6mm;

                    margin-bottom: 2.3mm;

                    background: var(--gold);

                }


                /* ============================================================
                   PROFESSIONAL PROFILE
                ============================================================ */

                .cv-profile {

                    margin: 0;

                    color: #f7f9fc;

                    font-size: 7.4pt;

                    line-height: 1.58;

                    font-weight: 400;

                }


                /* ============================================================
                   SKILLS
                ============================================================ */

                .cv-skill-group {

                    margin-bottom: 3.2mm;

                }


                .cv-skill-group h3 {

                    margin: 0 0 1.1mm;

                    color: var(--gold);

                    font-size: 7.4pt;

                    line-height: 1.2;

                    font-weight: 700;

                }


                .cv-skill-group ul,
                .cv-sidebar-list {

                    margin: 0;

                    padding-left: 3.8mm;

                }


                .cv-skill-group li,
                .cv-sidebar-list li {

                    margin-bottom: 0.8mm;

                    color: #ffffff;

                    font-size: 7.2pt;

                    line-height: 1.38;

                }


                /* ============================================================
                   REFERENCES
                ============================================================ */

                .cv-reference {

                    margin-bottom: 4mm;

                }


                .cv-reference strong {

                    display: block;

                    margin-bottom: 0.7mm;

                    color: #ffffff;

                    font-size: 7.5pt;

                    line-height: 1.3;

                    font-weight: 700;

                }


                .cv-reference span {

                    display: block;

                    margin-bottom: 0.7mm;

                    color: #f5f7fa;

                    font-size: 6.9pt;

                    line-height: 1.3;

                }


                /* =========================================
                BOTTOM-RIGHT SIDEBAR DECORATION
                ========================================= */

                .cv-sidebar {
                    position: relative;
                    overflow: hidden;
                }

                /* Gold filled corner */
                .cv-sidebar::after {
                    content: "";
                    position: absolute;

                    width: 125px;
                    height: 125px;

                    right: -1px;
                    bottom: -1px;

                    background: #f4c542;

                    clip-path: polygon(
                        100% 0,
                        100% 100%,
                        0 100%
                    );

                    z-index: 1;
                }

                /* Single thin gold diagonal line above the corner */
                .cv-sidebar .corner-line {
                    position: absolute;

                    width: 145px;
                    height: 2px;

                    right: -8px;
                    bottom: 82px;

                    background: #f4c542;

                    transform: rotate(-35deg);
                    transform-origin: right center;

                    z-index: 2;
                }


                /* ============================================================
                   MAIN CONTENT
                ============================================================ */

                .cv-main {

                    min-width: 0;

                    padding:
                        8.5mm
                        8mm
                        8mm;

                    background: #ffffff;

                }


                /* ============================================================
                   HEADER
                ============================================================ */

                .cv-header {

                    margin-bottom: 5mm;

                }


                .cv-header h1 {

                    margin: 0;

                    color: var(--navy);

                    font-size: 20pt;

                    line-height: 1.08;

                    font-weight: 800;

                    letter-spacing: 0;

                    text-transform: uppercase;

                    white-space: nowrap;

                }


                /*
                 * Thin grey rule.
                 */

                .cv-name-rule {

                    position: relative;

                    width: 100%;

                    height: 0.35mm;

                    margin-top: 2.7mm;

                    margin-bottom: 2.2mm;

                    background: #d8dce1;

                }


                /*
                 * Small gold section at the beginning of the rule.
                 */

                .cv-name-rule-gold {

                    width: 22mm;

                    height: 0.45mm;

                    background: var(--gold);

                }


                /* ============================================================
                   CONTACT INFORMATION
                ============================================================ */

                .cv-contact {

                    display: flex;

                    align-items: center;

                    width: 100%;

                    min-width: 0;

                    height: 5mm;

                    overflow: hidden;

                    white-space: nowrap;

                }


                .cv-contact-item {

                    display: flex;

                    align-items: center;

                    min-width: 0;

                    color: #26313f;

                    font-size: 6.8pt;

                    line-height: 1;

                    font-weight: 400;

                }


                .cv-contact-item + .cv-contact-item {

                    margin-left: 3.2mm;

                    padding-left: 3.2mm;

                    border-left:
                        0.28mm
                        solid
                        var(--gold);

                }


                .cv-contact-item svg {

                    width: 3.1mm;

                    height: 3.1mm;

                    flex-shrink: 0;

                    margin-right: 1.2mm;

                    color: var(--navy);

                    stroke-width: 2.2;

                }


                .cv-contact-item span {

                    min-width: 0;

                    overflow: hidden;

                    text-overflow: ellipsis;

                }


                /* ============================================================
                   SECTION
                ============================================================ */

                .cv-section {

                    margin-top: 4.5mm;

                    break-inside: avoid;

                    page-break-inside: avoid;

                }


                /* ============================================================
                   SECTION TITLE

                   Icon + heading + thin line.
                ============================================================ */

                .cv-section-title {

                    display: flex;

                    align-items: center;

                    width: 100%;

                    gap: 2.8mm;

                    margin-bottom: 3.1mm;

                }


                .cv-section-icon {

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    width: 9mm;

                    height: 9mm;

                    flex-shrink: 0;

                    border-radius: 50%;

                    background: var(--navy);

                    color: var(--gold);

                }


                .cv-section-icon svg {

                    width: 4.7mm;

                    height: 4.7mm;

                    stroke-width: 2;

                }


                .cv-section-title h2 {

                    flex-shrink: 0;

                    margin: 0;

                    color: var(--navy);

                    font-size: 9.1pt;

                    line-height: 1.1;

                    font-weight: 800;

                    text-transform: uppercase;

                    letter-spacing: 0;

                    white-space: nowrap;

                }


                /*
                 * Thin section rule.
                 */

                .cv-section-rule {

                    flex: 1;

                    min-width: 5mm;

                    height: 0.35mm;

                    background: var(--rule);

                }


                /* ============================================================
                   ENTRY
                ============================================================ */

                .cv-entry {

                    margin-left: 11.8mm;

                    margin-bottom: 3.5mm;

                    break-inside: avoid;

                    page-break-inside: avoid;

                }


                .cv-entry-heading {

                    display: grid;

                    grid-template-columns:
                        minmax(0, 1fr)
                        auto;

                    align-items: start;

                    gap: 5mm;

                }


                .cv-entry-heading h3 {

                    margin: 0;

                    color: #151c26;

                    font-size: 8.1pt;

                    line-height: 1.28;

                    font-weight: 700;

                }


                .cv-entry-subtitle {

                    margin:
                        0.7mm
                        0
                        0;

                    color: #3f4650;

                    font-size: 7.5pt;

                    line-height: 1.3;

                    font-style: italic;

                }


                .cv-date {

                    color: #26303d;

                    font-size: 7.2pt;

                    line-height: 1.3;

                    white-space: nowrap;

                    text-align: right;

                }


                /* ============================================================
                   BULLETS
                ============================================================ */

                .cv-bullets {

                    margin:
                        1.2mm
                        0
                        0;

                    padding-left: 4.1mm;

                }


                .cv-bullets li {

                    margin-bottom: 0.7mm;

                    color: #252c35;

                    font-size: 7.2pt;

                    line-height: 1.35;

                }


                .cv-bullets li::marker {

                    color: #111827;

                }


                /* ============================================================
                   SCREEN RESPONSIVENESS
                ============================================================ */

                @media screen and (max-width: 900px) {

                    .cv-document {

                        width: 100%;

                        min-height: auto;

                    }


                    .cv-layout {

                        grid-template-columns: 1fr;

                    }


                    .cv-sidebar {

                        min-height: auto;

                    }


                    .cv-main {

                        padding: 30px 25px;

                    }


                    .cv-header h1 {

                        font-size: 30px;

                        white-space: normal;

                    }


                    .cv-contact {

                        height: auto;

                        flex-wrap: wrap;

                        white-space: normal;

                        gap: 8px;

                    }


                    .cv-contact-item + .cv-contact-item {

                        margin-left: 0;

                        padding-left: 0;

                        border-left: 0;

                    }


                    .cv-entry-heading {

                        grid-template-columns: 1fr;

                    }


                    .cv-date {

                        text-align: left;

                    }

                }


                /* ============================================================
                   PRINT
                ============================================================ */

                @media print {

                    @page {

                        size: A4;

                        margin: 0;

                    }


                    html,
                    body {

                        margin: 0 !important;

                        padding: 0 !important;

                        background: #ffffff !important;

                    }


                    body * {

                        visibility: hidden !important;

                    }


                    #cv-document,
                    #cv-document * {

                        visibility: visible !important;

                    }


                    #cv-document {

                        position: absolute !important;

                        left: 0 !important;

                        top: 0 !important;

                        width: 210mm !important;

                        min-height: 297mm !important;

                        margin: 0 !important;

                        box-shadow: none !important;

                        overflow: visible !important;

                        -webkit-print-color-adjust: exact !important;

                        print-color-adjust: exact !important;

                    }


                    .cv-layout {

                        display: grid !important;

                        grid-template-columns:
                            61mm
                            149mm !important;

                        min-height: 297mm !important;

                    }


                    .cv-sidebar {

                        min-height: 297mm !important;

                        background: #062d5f !important;

                        -webkit-print-color-adjust: exact !important;

                        print-color-adjust: exact !important;

                    }


                    .cv-corner-decoration,
                    .cv-corner-gold,
                    .cv-corner-navy-line,
                    .cv-corner-gold-line {

                        -webkit-print-color-adjust: exact !important;

                        print-color-adjust: exact !important;

                    }


                    .cv-section,
                    .cv-entry {

                        break-inside: avoid !important;

                        page-break-inside: avoid !important;

                    }


                    .cv-section-title {

                        break-after: avoid !important;

                        page-break-after: avoid !important;

                    }

                }

            `}</style>

        </AuthenticatedLayout>
    );
}