import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ChevronLeft, Heart } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

type Quota = {
    quota_id: number;
    job_title: string;
    min_cgpa: number;
    total_slots: number;
    interview_required: boolean;
};

type Company = {
    company_id: number;
    company_name: string;
    description: string | null;
};

type StudentApplication = {
    application_id: number;
    quota_id: number;
};

interface Props {
    company: Company;
    quotas: Quota[];
    applications?: StudentApplication[];
}

export default function ViewCompany({ company, quotas, applications = [] }: Props) {

    const MAX_APPLICATIONS = 3;
    const remainingChoices = MAX_APPLICATIONS - applications.length;

    const handleApply = (quota_id: number) => {
        router.post(route('student.companies.apply', { company: company.company_id }), {
            quota_id
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Application submitted successfully!');
            },
            onError: (errors: any) => {
                const errorMessage = typeof errors === 'string'
                    ? errors
                    : Object.values(errors)[0] || 'An unknown error occurred';

                toast.error('Application Failed', {
                    description: errorMessage as string,
                    classNames: {
                        description: '!text-black font-semibold',
                    },
                    style: {
                        background: '#fff1f2',
                        border: '1px solid #fecaca',
                    },
                });
            }
        });
    };

    const handleCancel = (application_id?: number) => {
        if (!application_id) {
            toast.error('Unable to locate application ID.');
            return;
        }

        router.delete(route('student.applications.cancel', { application: application_id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Application cancelled successfully!');
            },
            onError: (errors: any) => {
                const errorMessage = typeof errors === 'string'
                    ? errors
                    : Object.values(errors)[0] || 'Failed to cancel application';

                toast.error('Cancellation Failed', {
                    description: errorMessage as string,
                });
            }
        });
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={route('student.companies')} className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Company Overview</h1>
                </div>
                
                <div className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Choices Remaining: {remainingChoices} / {MAX_APPLICATIONS}
                </div>
            </div>

            <div className="space-y-8">
                <section className="rounded-xl border border-black/10 bg-white p-6">
                    <h2 className="mb-3 text-xl font-sato font-bold text-black">{company.company_name}</h2>
                    <p className="text-sm text-black/70 leading-relaxed">{company.description || 'No description available.'}</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-bold font-sato text-black">Available Positions</h2>
                    {quotas.map((quota) => {
                        const matchedApplication = applications.find(
                            (app) => Number(app.quota_id) === Number(quota.quota_id)
                        );
                        
                        const isApplied = !!matchedApplication;
                        const isLimitReached = applications.length >= MAX_APPLICATIONS;

                        return (
                            <Card key={quota.quota_id} className="shadow-none">
                                <CardContent className="flex items-start justify-between p-6">
                                    <div className="flex-1">
                                        <h3 className="mb-4 text-lg font-bold font-sato text-black">{quota.job_title}</h3>
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-[12px] font-semibold text-black/40">Slots</p>
                                                <p className="text-sm">{quota.total_slots}</p>
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-semibold text-black/40">Interview Required</p>
                                                <p className="text-sm">{quota.interview_required ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex flex-col gap-2">
                                        {isApplied ? (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button className="w-36" variant="destructive" size="sm">
                                                        Cancel Application
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Application?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel your application for <strong>{quota.job_title}</strong>? This action will free up one of your application choices.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Keep Application</AlertDialogCancel>
                                                        <AlertDialogAction asChild>
                                                            <Button 
                                                                type="button"
                                                                className="bg-red-600 hover:bg-red-700"
                                                                onClick={() => handleCancel(matchedApplication?.application_id)}
                                                            >
                                                                Yes, Cancel
                                                            </Button>
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ) : (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button className="w-36" size="sm" disabled={isLimitReached}>
                                                        Apply
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirm Application</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            You are about to apply for <strong>{quota.job_title}</strong>. You have {remainingChoices} application choice(s) remaining out of {MAX_APPLICATIONS}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleApply(quota.quota_id)}>
                                                            Confirm & Apply
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}

                                        <Button variant="outline" className="w-36 gap-2" size="sm">
                                            <Heart className="h-4 w-4" /> Save
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </section>
            </div>
        </div>
    );
}

ViewCompany.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;