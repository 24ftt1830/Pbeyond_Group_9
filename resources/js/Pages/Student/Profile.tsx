import { useState, FormEvent, ChangeEvent } from 'react';
import { useForm, usePage } from '@inertiajs/react';

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

    // Personal information
    full_name: string;
    ic_number: string;
    ic_colour: string;
    intake_session: string;
    postal_address: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    religion: string;
    nationality: string;
    race: string;
    mobile_phone: string;
    cgpa: string;
    emergency_no: string;

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
    student: Student;
}
interface ProfileFormData {
    full_name: string;
    ic_number: string;
    ic_colour: string;
    intake_session: string;
    postal_address: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    religion: string;
    nationality: string;
    race: string;
    mobile_phone: string;
    cgpa: string;
    emergency_no: string;
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

export default function Profile({ student }: ProfileProps) {

    const [saveSuccess, setSaveSuccess] = useState(false);

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

    const { data, setData, post, processing, errors } =
    useForm<ProfileFormData>({

        // ----------------------------------------------------
        // Existing student information
        // ----------------------------------------------------

        full_name: student.full_name || '',
        ic_number: student.ic_number || '',
        ic_colour: student.ic_colour || 'Yellow',
        intake_session: student.intake_session || '',
        postal_address: student.postal_address || '',
        date_of_birth: student.date_of_birth || '',
        place_of_birth: student.place_of_birth || '',
        gender: student.gender || 'Male',
        religion: student.religion || '',
        nationality: student.nationality || '',
        race: student.race || '',
        mobile_phone: student.mobile_phone || '',
        cgpa: student.cgpa || '',
        emergency_no: student.emergency_no || '',

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
                start_date: item.start_date || '',
                end_date: item.end_date || '',
                description: item.description || '',
            })) || [],

        work_experiences:
            student.work_experiences?.map(item => ({
                id: item.id,
                company: item.company || '',
                position: item.position || '',
                start_date: item.start_date || '',
                end_date: item.end_date || '',
                description: item.description || '',
            })) || [],

        projects:
            student.projects?.map(item => ({
                id: item.id,
                title: item.title || '',
                description: item.description || '',
                technologies: item.technologies || '',
                project_url: item.project_url || '',
                start_date: item.start_date || '',
                end_date: item.end_date || '',
            })) || [],

        activities:
            student.activities?.map(item => ({
                id: item.id,
                title: item.title || '',
                description: item.description || '',
                role: item.role || '',
                start_date: item.start_date || '',
                end_date: item.end_date || '',
            })) || [],

        achievements:
            student.achievements?.map(item => ({
                id: item.id,
                title: item.title || '',
                description: item.description || '',
                issuer: item.issuer || '',
                achievement_date: item.achievement_date || '',
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

    post(route('student.profile.update'), {
        onSuccess: () => {
            setSaveSuccess(true);
        },
    });
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

    const removeEducation = (index: number) => {

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

    const removeWorkExperience = (index: number) => {

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

    const removeProject = (index: number) => {

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

    const removeActivity = (index: number) => {

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

    const removeAchievement = (index: number) => {

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

    const removeReferee = (index: number) => {

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

    const removeSoftSkill = (index: number) => {

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

    const removeTechnicalSkill = (index: number) => {
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

    const removeLanguage = (index: number) => {
        setData(
            'languages',
            data.languages.filter((_, i) => i !== index)
        );
    };


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <AuthenticatedLayout>

            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <div>
                    <h1 className="font-sato text-3xl font-bold">
                        My Profile
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Complete your profile information to build
                        your CV.
                    </p>
                </div>

{flash?.success && (
    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <div className="font-semibold">
            Success
        </div>

        <div>
            {flash.success}
        </div>
    </div>
)}

    {flash?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="font-semibold">
                Error
            </div>

            <div>
                {flash.error}
            </div>
        </div>
    )}

    
                <form
                    onSubmit={submit}
                    className="space-y-6"
                >


                    {/* ==================================================
                        PERSONAL INFORMATION
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>
                            <CardTitle>
                                Personal Information
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">


                            {/* Passport Photo */}

                            <div className="border-b pb-6">

                                <Label className="mb-3 block">
                                    Passport Photo
                                </Label>

                                <div className="flex flex-col sm:flex-row items-center gap-6">

                                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">

                                        {passportPreview ? (

                                            <img
                                                src={passportPreview}
                                                alt="Passport preview"
                                                className="w-full h-full object-cover"
                                            />

                                        ) : (

                                            <span className="text-gray-400 text-xs text-center">
                                                No photo
                                            </span>

                                        )}

                                    </div>


                                    <div>

                                        <Input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handlePhotoChange}
                                            className="shadow-none pt-1.5"
                                        />

                                        <p className="text-xs text-gray-500 mt-2">
                                            JPEG, PNG or JPG. Maximum 2MB.
                                        </p>

                                        {errors.passport_photo && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.passport_photo}
                                            </p>
                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* Personal fields */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                <div className="space-y-2">

                                    <Label>
                                        Full Name
                                    </Label>

                                    <Input
                                        value={data.full_name}
                                        onChange={e =>
                                            setData(
                                                'full_name',
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.full_name && (
                                        <p className="text-red-500 text-xs">
                                            {errors.full_name}
                                        </p>
                                    )}

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        IC Number
                                    </Label>

                                    <Input
                                        value={data.ic_number}
                                        onChange={e =>
                                            setData(
                                                'ic_number',
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.ic_number && (
                                        <p className="text-red-500 text-xs">
                                            {errors.ic_number}
                                        </p>
                                    )}

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        IC Colour
                                    </Label>

                                    <Select
                                        value={data.ic_colour}
                                        onValueChange={value =>
                                            setData(
                                                'ic_colour',
                                                value
                                            )
                                        }
                                    >

                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="Yellow">
                                                Yellow
                                            </SelectItem>

                                            <SelectItem value="Red">
                                                Red
                                            </SelectItem>

                                            <SelectItem value="Purple">
                                                Purple
                                            </SelectItem>

                                        </SelectContent>

                                    </Select>

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Intake Session
                                    </Label>

                                    <Input
                                        value={data.intake_session}
                                        onChange={e =>
                                            setData(
                                                'intake_session',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Date of Birth
                                    </Label>

                                    <Input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={e =>
                                            setData(
                                                'date_of_birth',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Place of Birth
                                    </Label>

                                    <Input
                                        value={data.place_of_birth}
                                        onChange={e =>
                                            setData(
                                                'place_of_birth',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Gender
                                    </Label>

                                    <Select
                                        value={data.gender}
                                        onValueChange={value =>
                                            setData(
                                                'gender',
                                                value
                                            )
                                        }
                                    >

                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="Male">
                                                Male
                                            </SelectItem>

                                            <SelectItem value="Female">
                                                Female
                                            </SelectItem>

                                        </SelectContent>

                                    </Select>

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Mobile Phone
                                    </Label>

                                    <Input
                                        value={data.mobile_phone}
                                        onChange={e =>
                                            setData(
                                                'mobile_phone',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Religion
                                    </Label>

                                    <Input
                                        value={data.religion}
                                        onChange={e =>
                                            setData(
                                                'religion',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Nationality
                                    </Label>

                                    <Input
                                        value={data.nationality}
                                        onChange={e =>
                                            setData(
                                                'nationality',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Race
                                    </Label>

                                    <Input
                                        value={data.race}
                                        onChange={e =>
                                            setData(
                                                'race',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="md:col-span-2 space-y-2">

                                    <Label>
                                        Postal Address
                                    </Label>

                                    <Textarea
                                        value={data.postal_address}
                                        onChange={e =>
                                            setData(
                                                'postal_address',
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        Emergency Contact
                                    </Label>

                                    <Input
                                        value={data.emergency_no}
                                        onChange={e =>
                                            setData(
                                                'emergency_no',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="space-y-2">

                                    <Label>
                                        CGPA
                                    </Label>

                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={data.cgpa}
                                        onChange={e =>
                                            setData(
                                                'cgpa',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        PROFESSIONAL PROFILE
                    ================================================== */}

                    <Card className="shadow-none">

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

                    </Card>


                    {/* ==================================================
                        EDUCATION
                    ================================================== */}

                    <Card className="shadow-none">

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

                                    <div
                                        key={education.id ?? index}
                                        className="border rounded-xl p-5 space-y-5"
                                    >

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

                                                <Label>
                                                    Institution
                                                </Label>

                                                <Input
                                                    value={education.institution}
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

                                                <Label>
                                                    Qualification
                                                </Label>

                                                <Input
                                                    value={education.qualification}
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

                                                <Label>
                                                    Field of Study
                                                </Label>

                                                <Input
                                                    value={education.field_of_study}
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

                                                <Label>
                                                    Start Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={education.start_date}
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

                                                <Label>
                                                    End Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={education.end_date}
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

                                                <Label>
                                                    Description
                                                </Label>

                                                <Textarea
                                                    value={education.description}
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

                                    </div>

                                ))

                            )}

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        WORK EXPERIENCE
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <CardTitle>
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

                                    <div
                                        key={experience.id ?? index}
                                        className="border rounded-xl p-5 space-y-5"
                                    >

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

                                                <Label>
                                                    Company
                                                </Label>

                                                <Input
                                                    value={experience.company}
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

                                                <Label>
                                                    Position
                                                </Label>

                                                <Input
                                                    value={experience.position}
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

                                                <Label>
                                                    Start Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={experience.start_date}
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

                                                <Label>
                                                    End Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={experience.end_date}
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

                                                <Label>
                                                    Description
                                                </Label>

                                                <Textarea
                                                    value={experience.description}
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

                                    </div>

                                ))

                            )}

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        PROJECTS
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <CardTitle>
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

                                    <div
                                        key={project.id ?? index}
                                        className="border rounded-xl p-5 space-y-5"
                                    >

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

                                                <Label>
                                                    Project Title
                                                </Label>

                                                <Input
                                                    value={project.title}
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

                                                <Label>
                                                    Technologies
                                                </Label>

                                                <Input
                                                    value={project.technologies}
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

                                                <Label>
                                                    Start Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={project.start_date}
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

                                                <Label>
                                                    End Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={project.end_date}
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

                                                <Label>
                                                    Project URL
                                                </Label>

                                                <Input
                                                    value={project.project_url}
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

                                                <Label>
                                                    Description
                                                </Label>

                                                <Textarea
                                                    value={project.description}
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

                                    </div>

                                ))

                            )}

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        ACTIVITIES
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <CardTitle>
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

                                    <div
                                        key={activity.id ?? index}
                                        className="border rounded-xl p-5 space-y-5"
                                    >

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

                                                <Label>
                                                    Activity
                                                </Label>

                                                <Input
                                                    value={activity.title}
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

                                                <Label>
                                                    Role
                                                </Label>

                                                <Input
                                                    value={activity.role}
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

                                                <Label>
                                                    Start Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={activity.start_date}
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

                                                <Label>
                                                    End Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={activity.end_date}
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

                                                <Label>
                                                    Description
                                                </Label>

                                                <Textarea
                                                    value={activity.description}
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

                                    </div>

                                ))

                            )}

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        ACHIEVEMENTS
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <CardTitle>
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

                                    <div
                                        key={achievement.id ?? index}
                                        className="border rounded-xl p-5 space-y-5"
                                    >

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

                                                <Label>
                                                    Achievement
                                                </Label>

                                                <Input
                                                    value={achievement.title}
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

                                                <Label>
                                                    Issuer / Organization
                                                </Label>

                                                <Input
                                                    value={achievement.issuer}
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

                                                <Label>
                                                    Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    value={achievement.achievement_date}
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

                                                <Label>
                                                    Description
                                                </Label>

                                                <Textarea
                                                    value={achievement.description}
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

                                    </div>

                                ))

                            )}

                        </CardContent>

                    </Card>

{/* ==================================================
    TECHNICAL SKILLS
================================================== */}

<Card className="shadow-none">

    <CardHeader>

        <div className="flex items-center justify-between gap-4">

            <div>

                <CardTitle>
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

                <div
                    key={skill.skill_id ?? index}
                    className="border rounded-xl p-5"
                >

                    <div className="flex items-center justify-between gap-4">

                        <div className="flex-1 space-y-2">

                            <Label>
                                Technical Skill {index + 1}
                            </Label>

                            <Input
                                value={skill.skill_name}
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

                </div>

            ))

        )}

    </CardContent>

</Card>

{/* ==================================================
    LANGUAGES
================================================== */}

<Card className="shadow-none">

    <CardHeader>

        <div className="flex items-center justify-between gap-4">

            <div>

                <CardTitle>
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

                <div
                    key={language.language_id ?? index}
                    className="border rounded-xl p-5"
                >

                    <div className="flex items-center justify-between gap-4">

                        <div className="flex-1 space-y-2">

                            <Label>
                                Language {index + 1}
                            </Label>

                            <Input
                                value={language.language_name}
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

                </div>

            ))

        )}

    </CardContent>

</Card>
                    {/* ==================================================
                        SOFT SKILLS
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <CardTitle>
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

                                    <div
                                        key={softSkill.id ?? index}
                                        className="border rounded-xl p-5 space-y-5"
                                    >

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

                                                <Label>
                                                    Skill
                                                </Label>

                                                <Input
                                                    value={softSkill.skill}
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

                                                <Label>
                                                    Description
                                                </Label>

                                                <Textarea
                                                    value={softSkill.description}
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

                                    </div>

                                ))

                            )}

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        REFEREES
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>

                            <div className="flex items-center justify-between gap-4">

                                <div>

                                    <CardTitle>
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

                                    <div
                                        key={referee.id ?? index}
                                        className="border rounded-xl p-5 space-y-5"
                                    >

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

                                                <Label>
                                                    Name
                                                </Label>

                                                <Input
                                                    value={referee.name}
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

                                                <Label>
                                                    Position
                                                </Label>

                                                <Input
                                                    value={referee.position}
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

                                                <Label>
                                                    Organization
                                                </Label>

                                                <Input
                                                    value={referee.organization}
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

                                                <Label>
                                                    Email
                                                </Label>

                                                <Input
                                                    type="email"
                                                    value={referee.email}
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

                                                <Label>
                                                    Phone
                                                </Label>

                                                <Input
                                                    value={referee.phone}
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

                                    </div>

                                ))

                            )}

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        EXISTING REQUIRED DOCUMENTS
                    ================================================== */}

                    <Card className="shadow-none">

                        <CardHeader>

                            <CardTitle>
                                Required Documents
                            </CardTitle>

                            <p className="text-sm text-gray-500">
                                Your CV is now generated from your profile.
                                You no longer need to upload a CV manually.
                            </p>

                        </CardHeader>


                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">


                            <div className="rounded-lg border p-5 bg-gray-50">

                                <p className="font-medium">
                                    Curriculum Vitae
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                    Your CV will be generated automatically
                                    from the information in this profile.
                                </p>

                                <p className="text-sm text-blue-600 mt-3 font-medium">
                                    CV Generator will be available after
                                    your profile is complete.
                                </p>

                            </div>


                            <div className="space-y-2">

                                <Label>
                                    Identity Card (IC)
                                </Label>

                                <Input
                                    type="file"
                                    className="shadow-none pt-1.5"
                                />

                                <p className="text-xs text-gray-500">
                                    Existing document upload.
                                </p>

                            </div>


                            <div className="space-y-2">

                                <Label>
                                    Driver's License
                                </Label>

                                <Input
                                    type="file"
                                    className="shadow-none pt-1.5"
                                />

                                <p className="text-xs text-gray-500">
                                    Existing document upload.
                                </p>

                            </div>


                            <div className="space-y-2">

                                <Label>
                                    Academic Results
                                </Label>

                                <Input
                                    type="file"
                                    className="shadow-none pt-1.5"
                                />

                                <p className="text-xs text-gray-500">
                                    Existing document upload.
                                </p>

                            </div>

                        </CardContent>

                    </Card>


                    {/* ==================================================
                        SAVE
                    ================================================== */}

                    <div className="flex justify-end pb-8">

                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8"
                        >

                            {processing
                                ? 'Saving...'
                                : 'Save Profile'
                            }

                        </Button>

                    </div>

                </form>

            </div>

        </AuthenticatedLayout>
    );
}