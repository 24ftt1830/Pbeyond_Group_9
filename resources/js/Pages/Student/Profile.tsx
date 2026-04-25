import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Profile({ student }) {
    const [formData, setFormData] = useState({
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
        work_experience: student.work_experience || '',
        emergency_no: student.emergency_no || '',
    });

    const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
    const [passportPreview, setPassportPreview] = useState<string | null>(
        student.passport_photo_path ? `/storage/${student.passport_photo_path}` : null
    );
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPassportPhoto(file);
            setPassportPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (passportPhoto) {
            data.append('passport_photo', passportPhoto);
        }

        router.post(route('student.profile.update'), data, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (err) => {
                setErrors(err);
                setSaving(false);
            },
        });
    };

    return (
        <div className="p-6">
            <h1 className="font-sato text-3xl font-bold mb-6">My Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white">
                {/* Passport Photo Section */}
                <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-3">Passport Photo (Required)</h2>
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                            {passportPreview ? (
                                <img src={passportPreview} alt="Passport preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-xs text-center">No photo</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handlePhotoChange}
                                required={!student.passport_photo_path}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-2">JPEG, PNG, JPG only. Max 2MB.</p>
                            {errors.passport_photo && <p className="text-red-500 text-xs mt-1">{errors.passport_photo}</p>}
                        </div>
                    </div>
                </div>

                {/* Personal Information Fields (unchanged) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">IC Number</label>
                        <input
                            type="text"
                            name="ic_number"
                            value={formData.ic_number}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.ic_number && <p className="text-red-500 text-xs mt-1">{errors.ic_number}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">IC Colour</label>
                        <select
                            name="ic_colour"
                            value={formData.ic_colour}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="Yellow">Yellow</option>
                            <option value="Red">Red</option>
                            <option value="Purple">Purple</option>
                        </select>
                        {errors.ic_colour && <p className="text-red-500 text-xs mt-1">{errors.ic_colour}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Intake Session</label>
                        <input
                            type="text"
                            name="intake_session"
                            value={formData.intake_session}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.intake_session && <p className="text-red-500 text-xs mt-1">{errors.intake_session}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Postal Address</label>
                        <textarea
                            name="postal_address"
                            rows={2}
                            value={formData.postal_address}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.postal_address && <p className="text-red-500 text-xs mt-1">{errors.postal_address}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
                        <input
                            type="text"
                            name="place_of_birth"
                            value={formData.place_of_birth}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.place_of_birth && <p className="text-red-500 text-xs mt-1">{errors.place_of_birth}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Religion</label>
                        <input
                            type="text"
                            name="religion"
                            value={formData.religion}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.religion && <p className="text-red-500 text-xs mt-1">{errors.religion}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nationality</label>
                        <input
                            type="text"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Race</label>
                        <input
                            type="text"
                            name="race"
                            value={formData.race}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.race && <p className="text-red-500 text-xs mt-1">{errors.race}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile Phone</label>
                        <input
                            type="tel"
                            name="mobile_phone"
                            value={formData.mobile_phone}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.mobile_phone && <p className="text-red-500 text-xs mt-1">{errors.mobile_phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">CGPA</label>
                        <input
                            type="number"
                            step="0.01"
                            name="cgpa"
                            value={formData.cgpa}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.cgpa && <p className="text-red-500 text-xs mt-1">{errors.cgpa}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                        <input
                            type="tel"
                            name="emergency_no"
                            value={formData.emergency_no}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.emergency_no && <p className="text-red-500 text-xs mt-1">{errors.emergency_no}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Work Experience (if any)</label>
                        <textarea
                            name="work_experience"
                            rows={3}
                            value={formData.work_experience}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.work_experience && <p className="text-red-500 text-xs mt-1">{errors.work_experience}</p>}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}

Profile.layout = (page) => <AuthenticatedLayout children={page} />;
