import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Building2, Mail, ShieldCheck, Users, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface Representative {
    user_id: number;
    username: string;
    email: string;
    role: string;
}

interface Company {
    company_id: number;
    company_name: string;
}

interface Props {
    company: Company | null;
    representatives: Representative[];
}

export default function Representatives({ company, representatives = [] }: Props) {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Representatives" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="font-sato text-3xl font-bold">Representatives</h1>
                        {company && (
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                <span className="text-sm">Team members at <span className="font-semibold text-foreground">{company.company_name}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                {!company ? (
                    <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-slate-50/50">
                        <div className="p-3 bg-white rounded-full border mb-4">
                            <Info className="size-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No Company Associated</h3>
                        <p className="max-w-sm mt-1">You aren't currently linked to a company. Please contact your system administrator to get assigned.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {representatives.length > 0 ? (
                            representatives.map((rep) => (
                                <Card key={rep.user_id} className="shadow-none">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="rounded-lg w-fit">
                                                <Users className="size-5 text-slate-600" />
                                            </div>
                                            {rep.user_id === auth.user.user_id && (
                                                <Badge variant="secondary">You</Badge>
                                            )}
                                        </div>
                                        <CardTitle className="mt-4 text-xl">{rep.username}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="size-4" />
                                            <span>{rep.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ShieldCheck className="size-4" />
                                            <span className="font-medium text-foreground">{rep.role} Access</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No team representatives found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

Representatives.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;