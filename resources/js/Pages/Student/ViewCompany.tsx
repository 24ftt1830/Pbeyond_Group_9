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

interface Props {
    company: Company;
    quotas: Quota[];
    applied_quota_ids: number[];
}

export default function ViewCompany({ company, quotas, applied_quota_ids }: Props) {

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

    const MAX_APPLICATIONS = 3;
    const remainingChoices = MAX_APPLICATIONS - applied_quota_ids.length;

    return (
        <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={route('student.companies')} className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Company Overview</h1>
                </div>
                
                {/* Visual badge showing remaining application slots */}
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
                        const isApplied = applied_quota_ids.includes(quota.quota_id);

                        // Disable if student already applied to this quota OR hit the limit of 3 choices
                        const isDisabled = isApplied || applied_quota_ids.length >= MAX_APPLICATIONS;

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
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="w-24" size="sm" disabled={isDisabled}>
                                                    {isApplied ? 'Applied' : 'Apply'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm Application</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        You are about to apply for {quota.job_title}. You have {remainingChoices} application choice(s) remaining out of {MAX_APPLICATIONS}.
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

                                        <Button variant="outline" className="w-24 gap-2" size="sm">
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