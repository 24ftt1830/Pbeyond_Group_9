import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';

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

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        router.post(route('student.profile.update'), formData, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: (err) => {
                setErrors(err);
                setSaving(false);
            },
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile (Borang ILD)</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
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

                    {/* IC Number */}
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

                    {/* IC Colour */}
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

                    {/* Intake Session */}
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

                    {/* Postal Address */}
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

                    {/* Date of Birth */}
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

                    {/* Place of Birth */}
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

                    {/* Gender */}
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

                    {/* Religion */}
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

                    {/* Nationality */}
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

                    {/* Race */}
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

                    {/* Mobile Phone */}
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

                    {/* CGPA */}
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

                    {/* Emergency No */}
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

                    {/* Work Experience (optional) */}
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
