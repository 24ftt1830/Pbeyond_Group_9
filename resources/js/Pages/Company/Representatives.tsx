import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Mail, ShieldCheck, Users, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface Representative {
    user_id: number | null;
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

export default function Representatives({
    company,
    representatives = [],
}: Props) {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Representatives" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-sato text-3xl font-bold">
                            Representatives
                        </h1>

                        {company && (
                            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                                <span className="text-sm">
                                    Team members at{' '}
                                    <span className="font-semibold text-foreground">
                                        {company.company_name}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {!company ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
                        <div className="mb-4 rounded-full border bg-white p-3">
                            <Info className="size-6 text-slate-400" />
                        </div>

                        <h3 className="text-lg font-semibold text-foreground">
                            No Company Associated
                        </h3>

                        <p className="mt-1 max-w-sm">
                            You aren't currently linked to a company. Please
                            contact your system administrator to get assigned.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {representatives.length > 0 ? (
                            representatives.map((rep, index) => (
                                <Card
                                    key={`${rep.role}-${rep.user_id ?? index}`}
                                    className="shadow-none"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="w-fit rounded-lg">
                                                <Users className="size-5 text-slate-600" />
                                            </div>

                                            {rep.user_id ===
                                                auth.user.user_id && (
                                                <Badge variant="secondary">
                                                    You
                                                </Badge>
                                            )}
                                        </div>

                                        <CardTitle className="mt-4 text-xl">
                                            {rep.username}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="size-4" />
                                            <span>{rep.email}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ShieldCheck className="size-4" />

                                            <span className="font-medium text-foreground">
                                                {rep.role} Access
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center text-muted-foreground">
                                No team representatives found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

Representatives.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);