import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

type Company = {
    id: number;
    name: string;
    status: string;
    quota_availability: number;
    interview_required: boolean | string;
    job_title: string;
    location: string;
    min_cgpa: number;
    application_deadline: string | null;
    description: string | null;
};

interface Props {
    company: Company;
    hasApplied?: boolean;
    userCgpa?: number;
}

export default function ViewCompany({ company, hasApplied = false, userCgpa }: Props) {
    const [showConfirmApplication, setShowConfirmApplication] = useState(false);
    const [showApplicationSuccess, setShowApplicationSuccess] = useState(false);
    const [showApplicationRejected, setShowApplicationRejected] = useState(false);
    const [isApplied, setIsApplied] = useState(hasApplied);
    const isCompanyFull = company.quota_availability <= 0 || company.status.toLowerCase() === 'full';

    const hasMetCgpaRequirement = userCgpa !== undefined ? userCgpa >= company.min_cgpa : true;
    const canApply = !isApplied && !isCompanyFull && hasMetCgpaRequirement;

    const handleStartApply = () => {
        if (isCompanyFull) {
            setShowApplicationRejected(true);
            return;
        }

        setShowConfirmApplication(true);
    };

    const handleConfirmApply = () => {
        router.post(route('student.companies.apply', company.id), undefined, {
            preserveScroll: true,
            onSuccess: () => {
                setIsApplied(true);
                setShowConfirmApplication(false);
                setShowApplicationSuccess(true);
            },
            onError: () => {
                setShowConfirmApplication(false);
                setShowApplicationRejected(true);
            },
        });
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">View Company</h1>
                <Link
                    href={route('student.companies')}
                    className="rounded-md border border-black px-4 py-2 text-sm text-black hover:bg-black/5"
                >
                    Back to Companies List
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_auto_320px]">
                <section className="rounded-xl border border-black/10 bg-white p-6 shadow">
                    <h2 className="mb-3 text-lg font-semibold text-black">{company.name}</h2>

                    <div className="space-y-5 text-sm leading-relaxed text-black/80">
                        <div>
                            <h3 className="mb-1 font-semibold text-black">Description</h3>
                            <p>{company.description || 'No description available for this company yet.'}</p>
                        </div>

                        <div>
                            <h3 className="mb-1 font-semibold text-black">Further Information</h3>
                            <p>
                                {company.additional_information ||
                                    'No further information available for this company yet.'}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="hidden w-px bg-black/10 lg:block" />

                <aside className="rounded-xl border border-black/10 bg-white p-6 shadow">
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black">Details</h2>
                    <table className="w-full border-collapse text-sm">
                        <tbody>
                            <tr className="border-b border-black/10">
                                <td className="py-2 pr-3 font-medium text-black">Availability</td>
                                <td className="py-2 text-black/80">{company.quota_availability}</td>
                            </tr>
                            <tr className="border-b border-black/10">
                                <td className="py-2 pr-3 font-medium text-black">Location</td>
                                <td className="py-2 text-black/80">{company.location}</td>
                            </tr>
                            <tr className="border-b border-black/10">
                                <td className="py-2 pr-3 font-medium text-black">Min. CGPA</td>
                                <td className="py-2 text-black/80">
                                {company.min_cgpa}
                                {!hasMetCgpaRequirement && (
                                    <span className="ml-2 block text-xs font-bold text-red-600">
                                        Requirement not met
                                    </span>
                                    )}
                                </td>
                            </tr>
                            <tr className="border-b border-black/10">
                                <td className="py-2 pr-3 font-medium text-black">Deadline</td>
                                <td className="py-2 text-black/80">{company.application_deadline}</td>
                            </tr>
                            <tr className="border-b border-black/10">
                                <td className="py-2 pr-3 font-medium text-black">Interview Required</td>
                                <td className="py-2 text-black/80">{company.interview_required ? 'Yes' : 'No'}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-3 font-medium text-black">Status</td>
                                <td className="py-2 text-black/80">{company.status}</td>
                            </tr>
                        </tbody>
                    </table>

                    <button
                        type="button"
                        onClick={handleStartApply}
                        disabled={isApplied}
                        className="mt-5 w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isApplied ? 'Applied' : !hasMetCgpaRequirement ? 'Ineligible' : 'Apply'}
                    </button>

                    {!hasMetCgpaRequirement && (
                        <p className="mt-2 text-center text-[10px] text-red-500">
                            You do not meet the minimum CGPA requirement to apply for this company.
                        </p>
                        )}
                </aside>
            </div>

            {showConfirmApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-black/10 bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-black">Confirm Application</h2>

                        <p className="mt-4 text-sm text-black/70">Are you sure you want to apply to</p>
                        <p className="mt-1 text-2xl font-bold text-black">{company.name}</p>

                        <p className="mt-4 text-sm leading-relaxed text-black/80">
                            Once you apply, your application will be submitted for review by the Industrial Linkages
                            Division. You will not be able to apply for this company again.
                        </p>

                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmApplication(false)}
                                className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmApply}
                                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showApplicationSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-black/10 bg-white p-6 shadow-lg">
                        <div className="flex justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-3xl font-bold text-white">
                                ✓
                            </div>
                        </div>

                        <h2 className="mt-4 text-center text-xl font-bold text-black">Application Submitted Successfully</h2>

                        <p className="mt-4 text-sm leading-relaxed text-black/80">
                            Your application has been successfully submitted.
                        </p>

                        <p className="mt-4 text-sm leading-relaxed text-black/80">
                            Industrial Linkage Division will review your application and update the status once a
                            decision has been made.
                        </p>

                        <p className="mt-4 text-sm leading-relaxed text-black/80">
                            You can track status in : Application Tracking
                        </p>

                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowApplicationSuccess(false)}
                                className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                            >
                                Close
                            </button>
                            <Link
                                href={route('student.application-tracking')}
                                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
                            >
                                Go to Application Tracking
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {showApplicationRejected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-black/10 bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-black">Application Rejected</h2>

                        <p className="mt-4 text-sm leading-relaxed text-black/80">
                            This company has no available slots. Your application cannot be submitted because the
                            positions are full.
                        </p>

                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setShowApplicationRejected(false)}
                                className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

ViewCompany.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
