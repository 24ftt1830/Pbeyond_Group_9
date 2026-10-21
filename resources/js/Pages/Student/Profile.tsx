import { confirmAction } from '@/lib/confirm-action';
import { useRef, useState, ChangeEvent, type ReactNode } from 'react';
import { UserRound, GraduationCap, Phone, FileText, FolderOpen, ChevronDown, Check, CircleAlert, Save } from 'lucide-react';
import { useForm, usePage, Link, router } from '@inertiajs/react';
import { toast } from "sonner";

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';

import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { RecordTabs } from '@/Components/Admin/RecordView';


// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatDateForInput = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};


// ============================================================
// TYPES
// ============================================================

interface Education {
    id?: number;
    institution: string;
    qualification: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
    description: string;
}

interface ProfessionalProfile {
    id?: number;
    profile: string;
}

interface WorkExperience {
    id?: number;
    company: string;
    position: string;
    start_date: string;
    end_date: string;
    description: string;
}

interface Project {
    id?: number;
    title: string;
    description: string;
    technologies: string;
    project_url: string;
    start_date: string;
    end_date: string;
}

interface Activity {
    id?: number;
    title: string;
    description: string;
    role: string;
    start_date: string;
    end_date: string;
}

interface Achievement {
    id?: number;
    title: string;
    description: string;
    issuer: string;
    achievement_date: string;
}

interface Referee {
    id?: number;
    name: string;
    position: string;
    organization: string;
    email: string;
    phone: string;
}

interface SoftSkill {
    id?: number;
    skill: string;
    description: string;
}

interface TechnicalSkill {
    skill_id?: number;
    skill_name: string;
}

interface Language {
    language_id?: number;
    language_name: string;
}

interface Student {
    student_id: number;
    pb_student_code?: string;
    programme?: { programme_name?: string } | null;
    user?: { email?: string } | null;

    // Personal information
    full_name: string;
    ic_number: string;
    ic_colour: string;
    intake_session: string;
    intake_semester_id?: number | null;
    intake_semester?: { id: number; name: string } | null;
    postal_address: string;
    district?: string | null;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    religion: string;
    nationality: string;
    race: string;
    mobile_phone: string;
    cgpa: string;
    emergency_no: string;
    emergency_no_2?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_relationship?: string | null;
    emergency_contact_name_2?: string | null;
    emergency_contact_relationship_2?: string | null;
    insurance_document_path?: string | null;

    // Legacy field - kept temporarily so existing data is not lost
    work_experience: string;

    passport_photo_path?: string;

    // CV information
    professional_profile?: ProfessionalProfile | null;

    education?: Education[];
    work_experiences?: WorkExperience[];
    projects?: Project[];
    activities?: Activity[];
    achievements?: Achievement[];
    referees?: Referee[];
    soft_skills?: SoftSkill[];

    // Existing systems
    skills?: TechnicalSkill[];
    languages?: Language[];
}

interface ProfileProps {
    adminContext?: boolean;
    student: Student;
    academicSemesters?: { id: number; name: string }[];
    canGenerateCv: boolean;
    missingProfileFields: string[];
    hasGeneratedCv: boolean;
    cvGeneratedAt?: string | null;
    insuranceDownloadUrl?: string | null;
}

interface ProfileFormData {
    full_name: string;
    ic_number: string;
    ic_colour: string;
    intake_semester_id: string;
    postal_address: string;
    district: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    religion: string;
    nationality: string;
    race: string;
    mobile_phone: string;
    cgpa: string;
    emergency_no: string;
    emergency_no_2: string;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_name_2: string;
    emergency_contact_relationship_2: string;
    insurance_document: File | null;
    work_experience: string;

    passport_photo: File | null;

    professional_profile: string;

    education: Education[];
    work_experiences: WorkExperience[];
    projects: Project[];
    activities: Activity[];
    achievements: Achievement[];
    referees: Referee[];
    soft_skills: SoftSkill[];

    skills: TechnicalSkill[];
    languages: Language[];
}


type TextProfileField = { [K in keyof ProfileFormData]: ProfileFormData[K] extends string ? K : never }[keyof ProfileFormData];

// ============================================================
// EMPTY OBJECT FACTORIES
// ============================================================

const emptyEducation = (): Education => ({
    id: undefined,
    institution: '',
    qualification: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: '',
});

const emptyWorkExperience = (): WorkExperience => ({
    id: undefined,
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
});

const emptyProject = (): Project => ({
    id: undefined,
    title: '',
    description: '',
    technologies: '',
    project_url: '',
    start_date: '',
    end_date: '',
});

const emptyActivity = (): Activity => ({
    id: undefined,
    title: '',
    description: '',
    role: '',
    start_date: '',
    end_date: '',
});

const emptyAchievement = (): Achievement => ({
    id: undefined,
    title: '',
    description: '',
    issuer: '',
    achievement_date: '',
});

const emptyReferee = (): Referee => ({
    id: undefined,
    name: '',
    position: '',
    organization: '',
    email: '',
    phone: '',
});

const emptySoftSkill = (): SoftSkill => ({
    id: undefined,
    skill: '',
    description: '',
});

const emptyTechnicalSkill = (): TechnicalSkill => ({
    skill_id: undefined,
    skill_name: '',
});

const emptyLanguage = (): Language => ({
    language_id: undefined,
    language_name: '',
});


// ============================================================
// COMPONENT
// ============================================================

function DocumentUploadField({ id, label, formats, accept, onChange, error, children }: {
    id: string;
    label: string;
    formats: string;
    accept: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    children?: ReactNode;
}) {
    return <div className="min-w-0 space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} type="file" accept={accept} onChange={onChange} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} aria-invalid={Boolean(error)} className="w-full min-w-0 bg-white" />
        <p id={`${id}-help`} className="text-xs text-slate-500">{formats} · Up to 5 MB</p>
        {error && <p id={`${id}-error`} className="text-sm text-red-600">{error}</p>}
        {children}
    </div>;
}

const profileSections = [
    { id: 'personal', label: 'Personal details', description: 'Your identity and contact information.', icon: UserRound },
    { id: 'academic', label: 'Academic details', description: 'Your programme, intake and education history.', icon: GraduationCap },
    { id: 'emergency', label: 'Emergency contacts', description: 'People we can contact in an emergency.', icon: Phone },
    { id: 'cv', label: 'CV builder', description: 'Build your CV with your skills and experience.', icon: FileText },
    { id: 'documents', label: 'Documents', description: 'Manage your internship documents.', icon: FolderOpen },
] as const;

type ProfileSection = typeof profileSections[number]['id'];

const sectionForField = (field: string): ProfileSection => {
    const root = field.split('.')[0];
    if (root.startsWith('emergency_')) return 'emergency';
    if (['education', 'cgpa', 'intake_semester_id', 'programme_id'].includes(root)) return 'academic';
    if (['insurance_document', 'ic_document', 'driver_license', 'academic_results'].includes(root)) return 'documents';
    if (['professional_profile', 'work_experiences', 'projects', 'activities', 'achievements', 'referees', 'soft_skills', 'skills', 'languages'].includes(root)) return 'cv';
    return 'personal';
};

const completionTargets: Record<string, { section: ProfileSection; field: string }> = {
    'Full Name': { section: 'personal', field: 'full_name' },
    'Email Address': { section: 'personal', field: 'profile-email' },
    'Identity Card Number': { section: 'personal', field: 'ic_number' },
    'Date of Birth': { section: 'personal', field: 'date_of_birth' },
    'Mobile Phone': { section: 'personal', field: 'mobile_phone' },
    'Postal Address': { section: 'personal', field: 'postal_address' },
    'Passport Photo': { section: 'personal', field: 'passport-photo' },
    'Academic Programme': { section: 'academic', field: 'profile-programme' },
    'Professional Profile': { section: 'cv', field: 'cv-professional-profile' },
    'Education History': { section: 'academic', field: 'academic-education' },
    'Technical Skills': { section: 'cv', field: 'cv-technical-skills' },
    'Languages': { section: 'cv', field: 'cv-languages' },
};

export default function Profile({
    adminContext = false,
    student,
    academicSemesters = [],
    canGenerateCv: profileCanGenerateCv,
    missingProfileFields = [],
    hasGeneratedCv,
    cvGeneratedAt,
    insuranceDownloadUrl,
}: ProfileProps) {
    const canGenerateCv = profileCanGenerateCv && !adminContext;

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [generatingCv, setGeneratingCv] = useState(false);
    const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
    const sectionHeading = useRef<HTMLHeadingElement>(null);
    const sectionNavigation = useRef<HTMLDivElement>(null);

    const openSection = (section: ProfileSection, field?: string) => {
        setActiveSection(section);
        requestAnimationFrame(() => {
            const fieldId = field === 'passport_photo' ? 'passport-photo' : field === 'insurance_document' ? 'insurance-document' : field;
            const record = field?.split('.').slice(0, 2).join('.');
            const target = (fieldId ? document.getElementById(fieldId) : null)
                ?? (record ? document.querySelector<HTMLElement>(`[data-profile-field="${CSS.escape(record)}"]`) : null)
                ?? sectionHeading.current;
            let disclosure = target?.closest('details');
            while (disclosure) {
                disclosure.open = true;
                disclosure = disclosure.parentElement?.closest('details');
            }
            target?.querySelector('details')?.setAttribute('open', '');
            (field ? target : sectionNavigation.current)?.scrollIntoView({ block: 'start' });
            const focusTarget = target?.matches('input, textarea, select, button, [tabindex]')
                ? target : target?.querySelector<HTMLElement>('input, textarea, select, summary');
            focusTarget?.focus({ preventScroll: true });
        });
    };

    const { flash } = usePage().props as {
        flash?: {
            success?: string;
            error?: string;
        };
    };

    const [passportPreview, setPassportPreview] = useState<string | null>(
        student.passport_photo_path
            ? `/storage/${student.passport_photo_path}`
            : null
    );


    // ========================================================
    // FORM
    // ========================================================

    const { data, setData, post, processing, errors, isDirty, setDefaults } =
    useForm<ProfileFormData>({

        // ----------------------------------------------------
        // Existing student information
        // ----------------------------------------------------

        full_name: student.full_name || '',
        ic_number: student.ic_number || '',
        ic_colour: student.ic_colour || 'Yellow',
        intake_semester_id: String(student.intake_semester_id ?? ''),
        postal_address: student.postal_address || '',
        district: student.district || '',
        date_of_birth: formatDateForInput(student.date_of_birth),
        place_of_birth: student.place_of_birth || '',
        gender: student.gender || 'Male',
        religion: student.religion || '',
        nationality: student.nationality || '',
        race: student.race || '',
        mobile_phone: student.mobile_phone || '',
        cgpa: student.cgpa || '',
        emergency_no: student.emergency_no || '',
        emergency_no_2: student.emergency_no_2 || '',
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_relationship: student.emergency_contact_relationship || '',
        emergency_contact_name_2: student.emergency_contact_name_2 || '',
        emergency_contact_relationship_2: student.emergency_contact_relationship_2 || '',
        insurance_document: null,

        // Keep the old database field temporarily.
        // We will retire this later after the new
        // structured work experience system is confirmed.
        work_experience: student.work_experience || '',

        passport_photo: null as File | null,

        // ----------------------------------------------------
        // CV Generator information
        // ----------------------------------------------------

        professional_profile:
            student.professional_profile?.profile || '',

        education:
            student.education?.map(item => ({
                id: item.id,
                institution: item.institution || '',
                qualification: item.qualification || '',
                field_of_study: item.field_of_study || '',
                start_date: formatDateForInput(item.start_date),
                end_date: formatDateForInput(item.end_date),
                description: item.description || '',
            })) || [],

        work_experiences:
            student.work_experiences?.map(item => ({
                id: item.id,
                company: item.company || '',
                position: item.position || '',
                start_date: formatDateForInput(item.start_date),
                end_date: formatDateForInput(item.end_date),
                description: item.description || '',
            })) || [],

        projects:
            student.projects?.map(item => ({
                id: item.id,
                title: item.title || '',
                description: item.description || '',
                technologies: item.technologies || '',
                project_url: item.project_url || '',
                start_date: formatDateForInput(item.start_date),
                end_date: formatDateForInput(item.end_date),
            })) || [],

        activities:
            student.activities?.map(item => ({
                id: item.id,
                title: item.title || '',
                description: item.description || '',
                role: item.role || '',
                start_date: formatDateForInput(item.start_date),
                end_date: formatDateForInput(item.end_date),
            })) || [],

        achievements:
            student.achievements?.map(item => ({
                id: item.id,
                title: item.title || '',
                description: item.description || '',
                issuer: item.issuer || '',
                achievement_date: formatDateForInput(item.achievement_date),
            })) || [],

        referees:
            student.referees?.map(item => ({
                id: item.id,
                name: item.name || '',
                position: item.position || '',
                organization: item.organization || '',
                email: item.email || '',
                phone: item.phone || '',
            })) || [],

        soft_skills:
            student.soft_skills?.map(item => ({
                id: item.id,
                skill: item.skill || '',
                description: item.description || '',
            })) || [],

        skills:
            student.skills?.map(item => ({
                skill_id: item.skill_id,
                skill_name: item.skill_name || '',
            })) || [],

        languages:
            student.languages?.map(item => ({
                language_id: item.language_id,
                language_name: item.language_name || '',
            })) || [],
    });


    // ========================================================
    // SUBMIT
    // ========================================================

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setSaveSuccess(false);
        const submittedData = { ...data };

        post(route(adminContext ? 'admin.students.profile.update' : 'student.profile.update', adminContext ? student.student_id : undefined), {
            preserveScroll: true,
            onSuccess: () => {
                setDefaults(submittedData);
                setSaveSuccess(true);
                toast.success('Profile changes saved.');
            },
            onError: (validationErrors) => {
                const firstField = Object.keys(validationErrors)[0];
                if (firstField) openSection(sectionForField(firstField), firstField);
                toast.error('Please check the highlighted profile details.');
            },
        });
    };


    // ========================================================
    // CV GENERATION
    // ========================================================

    const generateCv = () => {
        if (adminContext) return;
        if (isDirty) {
            toast.error('Save your profile changes before generating your CV.');
            return;
        }
        const missing: string[] = [];

        // Validation checks matching required CV criteria
        if (!data.mobile_phone) missing.push("Mobile Phone");
        if (!data.postal_address) missing.push("Postal Address");
        if (!data.professional_profile) missing.push("Professional Profile");
        if (data.education.length === 0) missing.push("Education");
        if (data.skills.length === 0) missing.push("Technical Skills");
        if (data.languages.length === 0) missing.push("Languages");

        // If any required field is missing, display Sonner toast alert and stop
        if (missing.length > 0) {
            toast.error("Must complete all required info to generate CV", {
                description: `Please fill in: ${missing.join(", ")}`,
            });
            return;
        }

        // Proceed if complete
        setGeneratingCv(true);

        router.post(
            route('student.cv-generator.generate'),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setGeneratingCv(false);
                },
            }
        );
    };


    // ========================================================
    // FILE HANDLING
    // ========================================================

    const handlePhotoChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        if (e.target.files && e.target.files[0]) {

            const file = e.target.files[0];

            setData('passport_photo', file);

            setPassportPreview(
                URL.createObjectURL(file)
            );
        }
    };


    // ========================================================
    // EDUCATION
    // ========================================================

    const addEducation = () => {

        setData('education', [
            ...data.education,
            emptyEducation(),
        ]);
    };

    const removeEducation = async (index: number) => {
        if (!(await confirmAction('Remove this education entry?'))) return;

        setData(
            'education',
            data.education.filter(
                (_, i) => i !== index
            )
        );
    };


    // ========================================================
    // WORK EXPERIENCE
    // ========================================================

    const addWorkExperience = () => {

        setData('work_experiences', [
            ...data.work_experiences,
            emptyWorkExperience(),
        ]);
    };

    const removeWorkExperience = async (index: number) => {
        if (!(await confirmAction('Remove this work experience?'))) return;

        setData(
            'work_experiences',
            data.work_experiences.filter(
                (_, i) => i !== index
            )
        );
    };


    // ========================================================
    // PROJECTS
    // ========================================================

    const addProject = () => {

        setData('projects', [
            ...data.projects,
            emptyProject(),
        ]);
    };

    const removeProject = async (index: number) => {
        if (!(await confirmAction('Remove this project?'))) return;

        setData(
            'projects',
            data.projects.filter(
                (_, i) => i !== index
            )
        );
    };


    // ========================================================
    // ACTIVITIES
    // ========================================================

    const addActivity = () => {

        setData('activities', [
            ...data.activities,
            emptyActivity(),
        ]);
    };

    const removeActivity = async (index: number) => {
        if (!(await confirmAction('Remove this activity?'))) return;

        setData(
            'activities',
            data.activities.filter(
                (_, i) => i !== index
            )
        );
    };


    // ========================================================
    // ACHIEVEMENTS
    // ========================================================

    const addAchievement = () => {

        setData('achievements', [
            ...data.achievements,
            emptyAchievement(),
        ]);
    };

    const removeAchievement = async (index: number) => {
        if (!(await confirmAction('Remove this achievement?'))) return;

        setData(
            'achievements',
            data.achievements.filter(
                (_, i) => i !== index
            )
        );
    };


    // ========================================================
    // REFEREES
    // ========================================================

    const addReferee = () => {

        setData('referees', [
            ...data.referees,
            emptyReferee(),
        ]);
    };

    const removeReferee = async (index: number) => {
        if (!(await confirmAction('Remove this referee?'))) return;

        setData(
            'referees',
            data.referees.filter(
                (_, i) => i !== index
            )
        );
    };


    // ========================================================
    // SOFT SKILLS
    // ========================================================

    const addSoftSkill = () => {

        setData('soft_skills', [
            ...data.soft_skills,
            emptySoftSkill(),
        ]);
    };

    const removeSoftSkill = async (index: number) => {
        if (!(await confirmAction('Remove this soft skill?'))) return;

        setData(
            'soft_skills',
            data.soft_skills.filter(
                (_, i) => i !== index
            )
        );
    };

    // ========================================================
    // TECHNICAL SKILLS
    // ========================================================

    const addTechnicalSkill = () => {
        setData('skills', [
            ...data.skills,
            emptyTechnicalSkill(),
        ]);
    };

    const removeTechnicalSkill = async (index: number) => {
        if (!(await confirmAction('Remove this technical skill?'))) return;
        setData(
            'skills',
            data.skills.filter((_, i) => i !== index)
        );
    };


    // ========================================================
    // LANGUAGES
    // ========================================================

    const addLanguage = () => {
        setData('languages', [
            ...data.languages,
            emptyLanguage(),
        ]);
    };

    const removeLanguage = async (index: number) => {
        if (!(await confirmAction('Remove this language?'))) return;
        setData(
            'languages',
            data.languages.filter((_, i) => i !== index)
        );
    };


    // ========================================================
    // RENDER
    // ========================================================

    const currentSection = profileSections.find(section => section.id === activeSection)!;
    const sectionErrors = (section: ProfileSection) => Object.entries(errors).filter(([field]) => sectionForField(field) === section);
    const textField = (name: TextProfileField, label: string, type = 'text', options: { maxLength?: number; placeholder?: string; step?: string; min?: number; max?: number } = {}) => (
        <div className="space-y-2" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} type={type} value={data[name]} onChange={event => setData(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} {...options} />
            {errors[name] && <p id={`${name}-error`} className="text-sm text-red-600">{errors[name]}</p>}
        </div>
    );
    const choiceField = (name: TextProfileField, label: string, choices: string[]) => (
        <div className="space-y-2" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <select id={name} className="ui-field h-10 w-full bg-white px-3" value={data[name]} onChange={event => setData(name, event.target.value)} aria-invalid={Boolean(errors[name])}>
                <option value="">Select {label.toLowerCase()}</option>
                {choices.map(choice => <option key={choice}>{choice}</option>)}
            </select>
            {errors[name] && <p className="text-sm text-red-600">{errors[name]}</p>}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {adminContext && <Link href={route('admin.students.show', student.student_id)} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">Back to student details</Link>}
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1>{adminContext ? 'Student profile' : 'My profile'}</h1>
                        <p>{student.full_name}{student.pb_student_code ? ` · ${student.pb_student_code}` : ''}</p>
                    </div>
                    <Badge variant={missingProfileFields.length ? 'warning' : 'success'}>
                        {missingProfileFields.length ? `${missingProfileFields.length} required items remaining` : 'Required details complete'}
                    </Badge>
                </header>
                {flash?.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flash.error}</p>}
                {missingProfileFields.length > 0 && <details className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-medium text-slate-800">Finish these details to generate your CV</summary>
                    <p className="mt-2 text-xs text-slate-500">Based on your saved profile. Choose an item to open its section.</p>
                    <div className="mt-3 flex flex-wrap gap-2">{missingProfileFields.map(item => {
                        const target = completionTargets[item];
                        return <button key={item} type="button" onClick={() => openSection(target?.section ?? 'personal', target?.field)} className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{item}</button>;
                    })}</div>
                </details>}
                <form onSubmit={submit} noValidate className="space-y-5">
                    <div className="space-y-5">
                        <div ref={sectionNavigation} className="scroll-mt-4">
                            <div className="lg:hidden">
                                <Label htmlFor="profile-section" className="mb-2 block">Profile section</Label>
                                <select id="profile-section" value={activeSection} onChange={event => openSection(event.target.value as ProfileSection)} className="ui-field h-11 w-full bg-white px-3">
                                    {profileSections.map(section => <option key={section.id} value={section.id}>{section.label}{sectionErrors(section.id).length > 0 ? ' — Needs attention' : ''}</option>)}
                                </select>
                            </div>
                            <div className="hidden lg:block">
                                <RecordTabs
                                    tabs={profileSections.map(section => section.label)}
                                    value={currentSection.label}
                                    onChange={label => {
                                        const section = profileSections.find(item => item.label === label);
                                        if (section) openSection(section.id);
                                    }}
                                    label="Profile sections"
                                />
                            </div>
                        </div>
                        <div className="min-w-0 space-y-5">
                            <h2 ref={sectionHeading} tabIndex={-1} className="sr-only">{currentSection.label}</h2>
                            {Object.keys(errors).length > 0 && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-semibold text-red-800">Some details need attention</p>
                                <ul className="mt-2 space-y-1">{Object.entries(errors).map(([field, message]) => <li key={field}><button type="button" className="text-left text-sm text-red-700 underline underline-offset-2" onClick={() => openSection(sectionForField(field), field)}>{message}</button></li>)}</ul>
                            </div>}
                            <section id="profile-panel-personal" aria-label="Personal details" hidden={activeSection !== 'personal'} className={activeSection === 'personal' ? 'grid items-start gap-6 xl:grid-cols-2' : 'hidden'}>
                                <Card>
                                    <CardHeader><CardTitle>Personal details</CardTitle><p className="text-sm text-slate-500">Your photo and identity information.</p></CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                                            {passportPreview ? <img src={passportPreview} alt="Passport preview" className="h-20 w-16 shrink-0 rounded-lg border object-cover" /> : <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><UserRound className="size-8" /></div>}
                                            <div className="min-w-0 space-y-2"><Label htmlFor="passport-photo">Passport photo</Label><Input id="passport-photo" type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} /><p className="text-xs text-slate-500">JPG or PNG, up to 2 MB.</p>{errors.passport_photo && <p className="text-sm text-red-600">{errors.passport_photo}</p>}</div>
                                        </div>
                                        <div className="grid gap-5 md:grid-cols-2">
                                            {textField('full_name', 'Full name', 'text', { maxLength: 150 })}
                                            {textField('ic_number', 'IC number', 'text', { maxLength: 20 })}
                                            {choiceField('ic_colour', 'IC colour', ['Yellow', 'Red', 'Purple'])}
                                            {textField('date_of_birth', 'Date of birth', 'date')}
                                            {textField('place_of_birth', 'Place of birth')}
                                            {choiceField('gender', 'Gender', ['Male', 'Female'])}
                                            {textField('nationality', 'Nationality')}
                                            {textField('religion', 'Religion')}
                                            {textField('race', 'Race')}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card><CardHeader><CardTitle>Contact information</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2"><Label htmlFor="profile-email">Account email</Label><Input id="profile-email" readOnly value={student.user?.email || ''} className="bg-slate-50" /><p className="text-xs text-slate-500">Contact Admin if your account email needs updating.</p></div>
                                    {textField('mobile_phone', 'Mobile phone', 'tel', { maxLength: 20 })}
                                    <div className="space-y-2 md:col-span-2"><Label htmlFor="postal_address">Postal address</Label><Textarea id="postal_address" rows={3} value={data.postal_address} onChange={event => setData('postal_address', event.target.value)} />{errors.postal_address && <p className="text-sm text-red-600">{errors.postal_address}</p>}</div>
                                    {choiceField('district', 'District', ['Brunei-Muara', 'Belait', 'Tutong', 'Temburong', 'Overseas'])}
                                </CardContent></Card>
                            </section>
                            <section id="profile-panel-academic" aria-label="Academic details" hidden={activeSection !== 'academic'} className={activeSection === 'academic' ? 'space-y-5' : 'hidden'}>
                                <Card><CardHeader><CardTitle>Current studies</CardTitle><p className="text-sm text-slate-500">Your student ID and programme are managed by Admin.</p></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2"><Label htmlFor="profile-student-id">Student ID</Label><Input id="profile-student-id" readOnly value={student.pb_student_code || 'Not assigned'} className="bg-slate-50" /></div>
                                    <div className="space-y-2"><Label htmlFor="profile-programme">Programme</Label><Input id="profile-programme" readOnly value={student.programme?.programme_name || 'Not assigned'} className="bg-slate-50" /></div>
                                    <div className="space-y-2"><Label htmlFor="intake_semester_id">Intake semester</Label>{adminContext ? <Select value={data.intake_semester_id} onValueChange={value => setData('intake_semester_id', value)}><SelectTrigger id="intake_semester_id"><SelectValue placeholder="Select intake semester" /></SelectTrigger><SelectContent className="max-h-64 overflow-y-auto">{academicSemesters.map(semester => <SelectItem key={semester.id} value={String(semester.id)}>{semester.name}</SelectItem>)}</SelectContent></Select> : <Input id="intake_semester_id" readOnly value={student.intake_semester?.name || student.intake_session || 'Not assigned'} className="bg-slate-50" />}{errors.intake_semester_id && <p className="text-sm text-red-600">{errors.intake_semester_id}</p>}</div>
                                    {textField('cgpa', 'CGPA', 'number', { step: '0.01', min: 0, max: 4 })}
                                </CardContent></Card>
                                <div id="academic-education" tabIndex={-1} className="scroll-mt-4"><Card className="shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle>
                                        Education
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add your academic qualifications.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEducation}
                                >
                                    + Add Education
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.education.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No education records added yet.
                                </div>
                            ) : (
                                data.education.map((education, index) => (
                                    <details key={education.id ?? index} open={!education.id} data-profile-field={`education.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{education.institution || `Education ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Education {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeEducation(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor={`education.${index}.institution`}> Institution </Label>
                                                <Input
                                                    id={`education.${index}.institution`} value={education.institution}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.education
                                                        ];
                                                        updated[index].institution =
                                                            e.target.value;
                                                        setData(
                                                            'education',
                                                            updated
                                                        );
                                                    }}
                                                    placeholder="e.g. Politeknik Brunei"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`education.${index}.qualification`}> Qualification </Label>
                                                <Input
                                                    id={`education.${index}.qualification`} value={education.qualification}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.education
                                                        ];
                                                        updated[index].qualification =
                                                            e.target.value;
                                                        setData(
                                                            'education',
                                                            updated
                                                        );
                                                    }}
                                                    placeholder="e.g. Level 5 Diploma"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`education.${index}.field_of_study`}> Field of Study </Label>
                                                <Input
                                                    id={`education.${index}.field_of_study`} value={education.field_of_study}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.education
                                                        ];
                                                        updated[index].field_of_study =
                                                            e.target.value;
                                                        setData(
                                                            'education',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`education.${index}.start_date`}> Start Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`education.${index}.start_date`} value={education.start_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.education
                                                        ];
                                                        updated[index].start_date =
                                                            e.target.value;
                                                        setData(
                                                            'education',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`education.${index}.end_date`}> End Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`education.${index}.end_date`} value={education.end_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.education
                                                        ];
                                                        updated[index].end_date =
                                                            e.target.value;
                                                        setData(
                                                            'education',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor={`education.${index}.description`}> Description </Label>
                                                <Textarea
                                                    id={`education.${index}.description`} value={education.description}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.education
                                                        ];
                                                        updated[index].description =
                                                            e.target.value;
                                                        setData(
                                                            'education',
                                                            updated
                                                        );
                                                    }}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card></div>
                            </section>
                            <section id="profile-panel-emergency" aria-label="Emergency contacts" hidden={activeSection !== 'emergency'} className={activeSection === 'emergency' ? 'space-y-5' : 'hidden'}>
                                <div className="grid gap-5 xl:grid-cols-2">{([
                                    { number: 1, name: 'emergency_contact_name', relationship: 'emergency_contact_relationship', phone: 'emergency_no' },
                                    { number: 2, name: 'emergency_contact_name_2', relationship: 'emergency_contact_relationship_2', phone: 'emergency_no_2' },
                                ] as const).map(contact => <Card key={contact.number} aria-labelledby={`emergency-contact-title-${contact.number}`}>
                                    <CardHeader><CardTitle id={`emergency-contact-title-${contact.number}`}>Emergency contact {contact.number}</CardTitle></CardHeader>
                                    <CardContent className="space-y-5">
                                    {textField(contact.name, 'Full name', 'text', { maxLength: 150 })}
                                    {textField(contact.relationship, 'Relationship', 'text', { placeholder: 'e.g. Mother, Father, Guardian', maxLength: 100 })}
                                    {textField(contact.phone, 'Phone number', 'tel', { maxLength: 20 })}
                                    </CardContent>
                                </Card>)}</div>
                            </section>
                            <section id="profile-panel-cv" aria-label="CV builder" hidden={activeSection !== 'cv'} className={activeSection === 'cv' ? 'space-y-5' : 'hidden'}>
                                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
                                    <h3 className="text-base font-semibold text-slate-900">Your CV</h3>
                                    <p className="mt-1 text-sm text-slate-600">{adminContext ? 'The student generates their CV from their own account.' : isDirty ? 'Save your changes before generating your CV.' : missingProfileFields.length ? 'Complete the required profile details, then save to generate your CV.' : 'Your saved profile is ready. Generate a CV to attach to applications.'}</p>
                                    {hasGeneratedCv && <p className="mt-2 text-xs text-slate-500">Profile edits appear in your CV after you regenerate it.{cvGeneratedAt && ` Last generated: ${new Date(cvGeneratedAt).toLocaleString()}.`}</p>}
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {hasGeneratedCv && <Button type="button" variant="outline" asChild><Link href={route(adminContext ? 'admin.students.cv' : 'student.cv-generator', adminContext ? student.student_id : undefined)}>Preview saved CV</Link></Button>}
                                        {!adminContext && <Button type="button" onClick={generateCv} disabled={!canGenerateCv || isDirty || generatingCv || processing}>{generatingCv ? 'Generating…' : hasGeneratedCv ? 'Regenerate CV' : 'Generate CV'}</Button>}
                                    </div>
                                </div>
                                <div id="cv-professional-profile" tabIndex={-1} className="scroll-mt-4"><Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>
                                Professional Profile
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                Write a short professional summary
                                that will appear on your CV.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="professional_profile"
                                aria-label="Professional summary"
                                value={data.professional_profile}
                                onChange={e =>
                                    setData(
                                        'professional_profile',
                                        e.target.value
                                    )
                                }
                                placeholder="Example: A motivated and responsible student with a strong interest in software development..."
                                rows={6}
                            />
                            {errors.professional_profile && (
                                <p className="text-red-500 text-xs mt-2">
                                    {errors.professional_profile}
                                </p>
                            )}
                        </CardContent>
                    </Card></div>
                                <details id="cv-technical-skills" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Technical Skills<span className="ml-2 text-xs font-normal text-slate-400">Required for CV</span></span><span className="text-xs text-slate-500">{data.skills.length} {data.skills.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Technical Skills
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add your technical and software-related skills.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addTechnicalSkill}
                                >
                                    + Add Skill
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.skills.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No technical skills added yet.
                                </div>
                            ) : (
                                data.skills.map((skill, index) => (
                                    <details key={skill.skill_id ?? index} open={!skill.skill_id} data-profile-field={`skills.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{skill.skill_name || `Technical skill ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor={`skills.${index}.skill_name`}> Technical Skill {index + 1} </Label>
                                                <Input
                                                    id={`skills.${index}.skill_name`} value={skill.skill_name}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.skills
                                                        ];
                                                        updated[index].skill_name =
                                                            e.target.value;
                                                        setData(
                                                            'skills',
                                                            updated
                                                        );
                                                    }}
                                                    placeholder="e.g. Laravel, React, MySQL"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeTechnicalSkill(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>
<details id="cv-languages" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Languages<span className="ml-2 text-xs font-normal text-slate-400">Required for CV</span></span><span className="text-xs text-slate-500">{data.languages.length} {data.languages.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Languages
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add the languages you can speak or use.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addLanguage}
                                >
                                    + Add Language
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.languages.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No languages added yet.
                                </div>
                            ) : (
                                data.languages.map((language, index) => (
                                    <details key={language.language_id ?? index} open={!language.language_id} data-profile-field={`languages.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{language.language_name || `Language ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor={`languages.${index}.language_name`}> Language {index + 1} </Label>
                                                <Input
                                                    id={`languages.${index}.language_name`} value={language.language_name}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.languages
                                                        ];
                                                        updated[index].language_name =
                                                            e.target.value;
                                                        setData(
                                                            'languages',
                                                            updated
                                                        );
                                                    }}
                                                    placeholder="e.g. English"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeLanguage(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>
<details id="cv-work-experience" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Work Experience<span className="ml-2 text-xs font-normal text-slate-400">Optional</span></span><span className="text-xs text-slate-500">{data.work_experiences.length} {data.work_experiences.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Work Experience
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add your internship, employment,
                                        or other relevant experience.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addWorkExperience}
                                >
                                    + Add Experience
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.work_experiences.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No work experience added yet.
                                </div>
                            ) : (
                                data.work_experiences.map((experience, index) => (
                                    <details key={experience.id ?? index} open={!experience.id} data-profile-field={`work_experiences.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{experience.company || `Work experience ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Experience {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeWorkExperience(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor={`work_experiences.${index}.company`}> Company </Label>
                                                <Input
                                                    id={`work_experiences.${index}.company`} value={experience.company}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.work_experiences
                                                        ];
                                                        updated[index].company =
                                                            e.target.value;
                                                        setData(
                                                            'work_experiences',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`work_experiences.${index}.position`}> Position </Label>
                                                <Input
                                                    id={`work_experiences.${index}.position`} value={experience.position}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.work_experiences
                                                        ];
                                                        updated[index].position =
                                                            e.target.value;
                                                        setData(
                                                            'work_experiences',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`work_experiences.${index}.start_date`}> Start Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`work_experiences.${index}.start_date`} value={experience.start_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.work_experiences
                                                        ];
                                                        updated[index].start_date =
                                                            e.target.value;
                                                        setData(
                                                            'work_experiences',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`work_experiences.${index}.end_date`}> End Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`work_experiences.${index}.end_date`} value={experience.end_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.work_experiences
                                                        ];
                                                        updated[index].end_date =
                                                            e.target.value;
                                                        setData(
                                                            'work_experiences',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor={`work_experiences.${index}.description`}> Description </Label>
                                                <Textarea
                                                    id={`work_experiences.${index}.description`} value={experience.description}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.work_experiences
                                                        ];
                                                        updated[index].description =
                                                            e.target.value;
                                                        setData(
                                                            'work_experiences',
                                                            updated
                                                        );
                                                    }}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>
<details id="cv-projects" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Projects<span className="ml-2 text-xs font-normal text-slate-400">Optional</span></span><span className="text-xs text-slate-500">{data.projects.length} {data.projects.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Projects
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add academic, personal, or professional
                                        projects.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addProject}
                                >
                                    + Add Project
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.projects.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No projects added yet.
                                </div>
                            ) : (
                                data.projects.map((project, index) => (
                                    <details key={project.id ?? index} open={!project.id} data-profile-field={`projects.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{project.title || `Project ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Project {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeProject(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor={`projects.${index}.title`}> Project Title </Label>
                                                <Input
                                                    id={`projects.${index}.title`} value={project.title}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.projects
                                                        ];
                                                        updated[index].title =
                                                            e.target.value;
                                                        setData(
                                                            'projects',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`projects.${index}.technologies`}> Technologies </Label>
                                                <Input
                                                    id={`projects.${index}.technologies`} value={project.technologies}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.projects
                                                        ];
                                                        updated[index].technologies =
                                                            e.target.value;
                                                        setData(
                                                            'projects',
                                                            updated
                                                        );
                                                    }}
                                                    placeholder="e.g. Laravel, React, MySQL"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`projects.${index}.start_date`}> Start Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`projects.${index}.start_date`} value={project.start_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.projects
                                                        ];
                                                        updated[index].start_date =
                                                            e.target.value;
                                                        setData(
                                                            'projects',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`projects.${index}.end_date`}> End Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`projects.${index}.end_date`} value={project.end_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.projects
                                                        ];
                                                        updated[index].end_date =
                                                            e.target.value;
                                                        setData(
                                                            'projects',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor={`projects.${index}.project_url`}> Project URL </Label>
                                                <Input
                                                    id={`projects.${index}.project_url`} value={project.project_url}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.projects
                                                        ];
                                                        updated[index].project_url =
                                                            e.target.value;
                                                        setData(
                                                            'projects',
                                                            updated
                                                        );
                                                    }}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor={`projects.${index}.description`}> Description </Label>
                                                <Textarea
                                                    id={`projects.${index}.description`} value={project.description}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.projects
                                                        ];
                                                        updated[index].description =
                                                            e.target.value;
                                                        setData(
                                                            'projects',
                                                            updated
                                                        );
                                                    }}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>
<details id="cv-activities" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Activities<span className="ml-2 text-xs font-normal text-slate-400">Optional</span></span><span className="text-xs text-slate-500">{data.activities.length} {data.activities.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Activities
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add leadership, clubs, volunteering,
                                        or co-curricular activities.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addActivity}
                                >
                                    + Add Activity
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.activities.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No activities added yet.
                                </div>
                            ) : (
                                data.activities.map((activity, index) => (
                                    <details key={activity.id ?? index} open={!activity.id} data-profile-field={`activities.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{activity.title || `Activity ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Activity {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeActivity(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor={`activities.${index}.title`}> Activity </Label>
                                                <Input
                                                    id={`activities.${index}.title`} value={activity.title}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.activities
                                                        ];
                                                        updated[index].title =
                                                            e.target.value;
                                                        setData(
                                                            'activities',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`activities.${index}.role`}> Role </Label>
                                                <Input
                                                    id={`activities.${index}.role`} value={activity.role}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.activities
                                                        ];
                                                        updated[index].role =
                                                            e.target.value;
                                                        setData(
                                                            'activities',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`activities.${index}.start_date`}> Start Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`activities.${index}.start_date`} value={activity.start_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.activities
                                                        ];
                                                        updated[index].start_date =
                                                            e.target.value;
                                                        setData(
                                                            'activities',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`activities.${index}.end_date`}> End Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`activities.${index}.end_date`} value={activity.end_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.activities
                                                        ];
                                                        updated[index].end_date =
                                                            e.target.value;
                                                        setData(
                                                            'activities',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor={`activities.${index}.description`}> Description </Label>
                                                <Textarea
                                                    id={`activities.${index}.description`} value={activity.description}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.activities
                                                        ];
                                                        updated[index].description =
                                                            e.target.value;
                                                        setData(
                                                            'activities',
                                                            updated
                                                        );
                                                    }}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>
<details id="cv-achievements" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Achievements<span className="ml-2 text-xs font-normal text-slate-400">Optional</span></span><span className="text-xs text-slate-500">{data.achievements.length} {data.achievements.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Achievements
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add awards, competitions, honours,
                                        or other achievements.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addAchievement}
                                >
                                    + Add Achievement
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.achievements.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No achievements added yet.
                                </div>
                            ) : (
                                data.achievements.map((achievement, index) => (
                                    <details key={achievement.id ?? index} open={!achievement.id} data-profile-field={`achievements.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{achievement.title || `Achievement ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Achievement {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeAchievement(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor={`achievements.${index}.title`}> Achievement </Label>
                                                <Input
                                                    id={`achievements.${index}.title`} value={achievement.title}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.achievements
                                                        ];
                                                        updated[index].title =
                                                            e.target.value;
                                                        setData(
                                                            'achievements',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`achievements.${index}.issuer`}> Issuer / Organization </Label>
                                                <Input
                                                    id={`achievements.${index}.issuer`} value={achievement.issuer}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.achievements
                                                        ];
                                                        updated[index].issuer =
                                                            e.target.value;
                                                        setData(
                                                            'achievements',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`achievements.${index}.achievement_date`}> Date </Label>
                                                <Input
                                                    type="date"
                                                    id={`achievements.${index}.achievement_date`} value={achievement.achievement_date}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.achievements
                                                        ];
                                                        updated[index].achievement_date =
                                                            e.target.value;
                                                        setData(
                                                            'achievements',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor={`achievements.${index}.description`}> Description </Label>
                                                <Textarea
                                                    id={`achievements.${index}.description`} value={achievement.description}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.achievements
                                                        ];
                                                        updated[index].description =
                                                            e.target.value;
                                                        setData(
                                                            'achievements',
                                                            updated
                                                        );
                                                    }}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>
<details id="cv-soft-skills" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Soft Skills<span className="ml-2 text-xs font-normal text-slate-400">Optional</span></span><span className="text-xs text-slate-500">{data.soft_skills.length} {data.soft_skills.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Soft Skills
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add your personal and interpersonal skills.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addSoftSkill}
                                >
                                    + Add Skill
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.soft_skills.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No soft skills added yet.
                                </div>
                            ) : (
                                data.soft_skills.map((softSkill, index) => (
                                    <details key={softSkill.id ?? index} open={!softSkill.id} data-profile-field={`soft_skills.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{softSkill.skill || `Soft skill ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Skill {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeSoftSkill(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`soft_skills.${index}.skill`}> Skill </Label>
                                                <Input
                                                    id={`soft_skills.${index}.skill`} value={softSkill.skill}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.soft_skills
                                                        ];
                                                        updated[index].skill =
                                                            e.target.value;
                                                        setData(
                                                            'soft_skills',
                                                            updated
                                                        );
                                                    }}
                                                    placeholder="e.g. Communication"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`soft_skills.${index}.description`}> Description </Label>
                                                <Textarea
                                                    id={`soft_skills.${index}.description`} value={softSkill.description}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.soft_skills
                                                        ];
                                                        updated[index].description =
                                                            e.target.value;
                                                        setData(
                                                            'soft_skills',
                                                            updated
                                                        );
                                                    }}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>
<details id="cv-referees" className="group/cv scroll-mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><span className="flex-1 text-sm font-semibold text-slate-800">Referees<span className="ml-2 text-xs font-normal text-slate-400">Optional</span></span><span className="text-xs text-slate-500">{data.referees.length} {data.referees.length === 1 ? 'entry' : 'entries'}</span><ChevronDown className="size-4 text-slate-400 transition-transform group-open/cv:rotate-180" /></summary>
        <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="sr-only">
                                        Referees
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add people who can provide a professional
                                        or academic reference.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addReferee}
                                >
                                    + Add Referee
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.referees.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
                                    No referees added yet.
                                </div>
                            ) : (
                                data.referees.map((referee, index) => (
                                    <details key={referee.id ?? index} open={!referee.id} data-profile-field={`referees.${index}`} className="group/entry rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 break-words">{referee.name || `Referee ${index + 1}`}</span><ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open/entry:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-slate-100 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Referee {index + 1}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeReferee(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor={`referees.${index}.name`}> Name </Label>
                                                <Input
                                                    id={`referees.${index}.name`} value={referee.name}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.referees
                                                        ];
                                                        updated[index].name =
                                                            e.target.value;
                                                        setData(
                                                            'referees',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`referees.${index}.position`}> Position </Label>
                                                <Input
                                                    id={`referees.${index}.position`} value={referee.position}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.referees
                                                        ];
                                                        updated[index].position =
                                                            e.target.value;
                                                        setData(
                                                            'referees',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`referees.${index}.organization`}> Organization </Label>
                                                <Input
                                                    id={`referees.${index}.organization`} value={referee.organization}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.referees
                                                        ];
                                                        updated[index].organization =
                                                            e.target.value;
                                                        setData(
                                                            'referees',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`referees.${index}.email`}> Email </Label>
                                                <Input
                                                    type="email"
                                                    id={`referees.${index}.email`} value={referee.email}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.referees
                                                        ];
                                                        updated[index].email =
                                                            e.target.value;
                                                        setData(
                                                            'referees',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`referees.${index}.phone`}> Phone </Label>
                                                <Input
                                                    id={`referees.${index}.phone`} value={referee.phone}
                                                    onChange={e => {
                                                        const updated = [
                                                            ...data.referees
                                                        ];
                                                        updated[index].phone =
                                                            e.target.value;
                                                        setData(
                                                            'referees',
                                                            updated
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div></details>
                                ))
                            )}
                        </CardContent>
                    </Card>
    </details>

                            </section>
                            <section id="profile-panel-documents" aria-label="Documents" hidden={activeSection !== 'documents'} className={activeSection === 'documents' ? 'space-y-5' : 'hidden'}><Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>
                                Supporting documents
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                Keep your internship documents together. Save changes after choosing a file.
                            </p>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <DocumentUploadField id="insurance-document" label="Insurance document" formats="PDF, JPG or PNG" accept=".pdf,.jpg,.jpeg,.png" onChange={event => setData('insurance_document', event.target.files?.[0] ?? null)} error={errors.insurance_document}>
                                {insuranceDownloadUrl && <a href={insuranceDownloadUrl} className="text-sm font-medium text-blue-600 hover:underline">Download current document</a>}
                            </DocumentUploadField>
                            <DocumentUploadField id="ic-document" label="Identity card (IC)" formats="PDF" accept=".pdf" />
                            <DocumentUploadField id="driver-license" label="Driver’s licence" formats="PDF" accept=".pdf" />
                            <DocumentUploadField id="academic-results" label="Academic results" formats="PDF" accept=".pdf" />
                        </CardContent>
                    </Card></section>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                        <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-slate-500">{isDirty ? <><span className="size-2 rounded-full bg-amber-400" />Unsaved changes</> : saveSuccess ? <><Check className="size-4 text-emerald-600" />Changes saved</> : 'Changes across all sections are saved together.'}</p>
                        <Button type="submit" disabled={processing || !isDirty} className="gap-2"><Save className="size-4" />{processing ? 'Saving…' : 'Save changes'}</Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
