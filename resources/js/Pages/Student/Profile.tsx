import { useRef, useState, FormEvent, ChangeEvent } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";

interface Student {
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
    passport_photo_path?: string;
}

interface ProfileProps {
    student: Student;
}

export default function Profile({ student }: ProfileProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [passportPreview, setPassportPreview] = useState<string | null>(
        student.passport_photo_path ? `/storage/${student.passport_photo_path}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
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
        work_experience: student.work_experience || '',
        passport_photo: null as File | null,
        cv: null as File | null,
        identity_card: null as File | null,
        drivers_license: null as File | null,
        results: null as File | null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('passport_photo', file);
            setPassportPreview(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldName: keyof typeof data) => {
        if (e.target.files && e.target.files[0]) {
            setData(fieldName, e.target.files[0]);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Profile</h1>

                <form onSubmit={submit} className="space-y-6">
                    {/* Personal Information Card */}
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="border-b pb-6">
                                <Label className="mb-3 block">Passport Photo (Required)</Label>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                                        {passportPreview ? (
                                            <img src={passportPreview} alt="Passport preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-xs text-center">No photo</span>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handlePhotoChange}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">JPEG, PNG, JPG only. Max 2MB.</p>
                                        {errors.passport_photo && <p className="text-red-500 text-xs mt-1">{errors.passport_photo}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={data.full_name} onChange={e => setData('full_name', e.target.value)} required />
                                    {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>IC Number</Label>
                                    <Input value={data.ic_number} onChange={e => setData('ic_number', e.target.value)} required />
                                    {errors.ic_number && <p className="text-red-500 text-xs">{errors.ic_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>IC Colour</Label>
                                    <Select value={data.ic_colour} onValueChange={(val) => setData('ic_colour', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yellow">Yellow</SelectItem>
                                            <SelectItem value="Red">Red</SelectItem>
                                            <SelectItem value="Purple">Purple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Intake Session</Label>
                                    <Input value={data.intake_session} onChange={e => setData('intake_session', e.target.value)} />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label>Postal Address</Label>
                                    <Textarea value={data.postal_address} onChange={e => setData('postal_address', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Required Documents Card */}
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Required Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Curriculum Vitae (CV)</Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'cv')} />
                                {errors.cv && <p className="text-red-500 text-xs">{errors.cv}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Identity Card (IC)</Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'identity_card')} />
                                {errors.identity_card && <p className="text-red-500 text-xs">{errors.identity_card}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Driver's License</Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'drivers_license')} />
                                {errors.drivers_license && <p className="text-red-500 text-xs">{errors.drivers_license}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Academic Results</Label>
                                <Input type="file" onChange={(e) => handleFileChange(e, 'results')} />
                                {errors.results && <p className="text-red-500 text-xs">{errors.results}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Details Card */}
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>CGPA</Label>
                                <Input type="number" step="0.01" value={data.cgpa} onChange={e => setData('cgpa', e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Work Experience</Label>
                                <Textarea value={data.work_experience} onChange={e => setData('work_experience', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}