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
        <div className="w-full px-4 py-10 mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">
            <Head title="Representatives" />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <header>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Representatives</h1>
                    {company && (
                        <div className="flex items-center gap-2 mt-2 text-slate-500">
                            <Building2 className="size-4" />
                            <span className="text-sm font-medium">Team members at <span className="text-slate-900 font-bold">{company.company_name}</span></span>
                        </div>
                    )}
                </header>
            </div>

            {!company ? (
                /* if User is Unaffiliated / No Company Assigned */
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-12 text-center">
                    <div className="p-4 mb-4 bg-white border shadow-sm rounded-2xl">
                        <Info className="size-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">No Company Associated</h2>
                    <p className="max-w-xs mt-2 text-sm text-slate-500">
                        You aren't currently linked to a company. Please contact your system administrator to get assigned.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {representatives.length > 0 ? (
                        representatives.map((rep) => (
                            <Card key={rep.user_id} className="overflow-hidden transition-all border-slate-200 hover:shadow-md group">
                                <CardHeader className="pb-4 bg-slate-50/80 border-b border-slate-100">
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 transition-colors bg-white border border-slate-200 rounded-xl group-hover:border-slate-900">
                                            <Users className="size-5 text-slate-600 group-hover:text-slate-900" />
                                        </div>
                                        {rep.user_id === auth.user.user_id && (
                                            <Badge className="bg-slate-900 text-white border-none text-[10px] uppercase tracking-wider">
                                                You
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4 text-xl font-black tracking-tight text-slate-900 uppercase">
                                        {rep.username}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                            <Mail className="size-3.5 text-slate-500" />
                                        </div>
                                        <span className="truncate">{rep.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                            <ShieldCheck className="size-3.5 text-slate-500" />
                                        </div>
                                        <span className="font-medium">{rep.role} Access</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-400 text-sm">
                            No team representatives found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

Representatives.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;