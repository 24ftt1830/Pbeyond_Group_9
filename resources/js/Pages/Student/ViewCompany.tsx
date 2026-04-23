import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ChevronLeft, Heart } from 'lucide-react';
import { Button } from '@/Components/ui/button'; 
import { Card, CardContent } from '@/Components/ui/card'; 
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
}

export default function ViewCompany({ company, quotas }: Props) {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href={route('student.companies')}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
                    title="Back to Companies List"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold">Company Overview</h1>
            </div>

            <div className="space-y-8">
                {/* Company Info Section */}
                <section className="rounded-xl border border-black/10 bg-white p-6">
                    <h2 className="mb-3 text-xl font-bold text-black">{company.company_name}</h2>
                    <p className="text-sm text-black/70 leading-relaxed">
                        {company.description || 'No description available for this company yet.'}
                    </p>
                </section>

                {/* Positions Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-black">Available Positions</h2>
                    
                    {quotas.length > 0 ? (
                        <div className="grid gap-4">
                            {quotas.map((quota) => (
                                <Card key={quota.quota_id} className="shadow-none">
                                    <CardContent className="flex items-start justify-between p-6">
                                        {/* Left Side: Details */}
                                        <div className="flex-1">
                                            <h3 className="mb-4 text-lg font-bold text-black">{quota.job_title}</h3>
                                            <div className="flex flex-wrap gap-8">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-black/50">Seats</p>
                                                    <p className="text-sm font-semibold text-black">{quota.total_slots}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-black/50">Min CGPA</p>
                                                    <p className="text-sm font-semibold text-black">{quota.min_cgpa}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-black/50">Interview</p>
                                                    <p className="text-sm font-semibold text-black">
                                                        {quota.interview_required ? 'Yes' : 'No'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Actions */}
                                        <div className="ml-4 flex flex-col gap-2">
                                            <Button className="w-24">Apply</Button>
                                            <Button variant="outline" className="w-24 gap-2">
                                                <Heart className="h-4 w-4" /> Save
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-black/10 bg-gray-50 p-6 text-center">
                            <p className="text-sm text-black/50">No positions available for your programme.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

ViewCompany.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;