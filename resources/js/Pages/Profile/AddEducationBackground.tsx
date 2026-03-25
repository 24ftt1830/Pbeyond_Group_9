import { Link, useForm } from '@inertiajs/react';
import AccountSectionLayout from './Partials/AccountSectionLayout';

export default function AddEducationBackground() {
    const { data, setData, post, processing } = useForm({
        educationLevel: '',
        institution: '',
        durationStart: '',
        durationEnd: '',
        gradeResult: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setData(e.target.name as any, e.target.value);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.education-background-store'), {
            onSuccess: () => {
                // Redirect back to education background list after saving
            },
        });
    };

    return (
        <AccountSectionLayout title="Add New Education Background">
            <div className="mx-auto w-full max-w-md rounded-xl border border-black/10 bg-white p-6 shadow">
                <h2 className="mb-6 text-center text-xl font-semibold text-black">Add New Education Background</h2>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="education-level" className="text-sm font-medium text-black">
                            Education Level:
                        </label>
                        <input
                            id="education-level"
                            name="educationLevel"
                            type="text"
                            value={data.educationLevel}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="institution" className="text-sm font-medium text-black">
                            Institution:
                        </label>
                        <input
                            id="institution"
                            name="institution"
                            type="text"
                            value={data.institution}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-black">Duration:</label>
                        <div className="mt-1 flex gap-2 items-center">
                            <input
                                name="durationStart"
                                type="date"
                                value={data.durationStart}
                                onChange={handleChange}
                                className="flex-1 rounded-md border border-black/20 px-3 py-2 text-sm"
                            />
                            <span className="text-black">-</span>
                            <input
                                name="durationEnd"
                                type="date"
                                value={data.durationEnd}
                                onChange={handleChange}
                                className="flex-1 rounded-md border border-black/20 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="grade-result" className="text-sm font-medium text-black">
                            Grade/Result:
                        </label>
                        <input
                            id="grade-result"
                            name="gradeResult"
                            type="text"
                            value={data.gradeResult}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border border-black/20 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Link
                            href={route('profile.education-background')}
                            className="rounded-md bg-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/20"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </AccountSectionLayout>
    );
}
