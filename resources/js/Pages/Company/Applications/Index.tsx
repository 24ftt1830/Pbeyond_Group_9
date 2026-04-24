import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ChevronRight, LayoutGrid } from "lucide-react";

export default function Applications({ quotas = [] }: { quotas: any[] }) {
    return (
        <>
            <Head title="Applications" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-sato text-3xl font-bold">Applications</h1>
                </div>

                {/* Main Content Area */}
                {quotas.length > 0 ? (
                    <div className="rounded-xl border bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Job Title</TableHead>
                                    <TableHead>Programme</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Applications</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotas.map((quota) => {
                                    console.log("Quota ID:", quota.quota_id, "Slug:", quota.slug);

                                    return (
                                        <TableRow key={quota.quota_id} className="group">
                                            <TableCell className="font-medium">
                                                {quota.job_title}
                                            </TableCell>
                                            <TableCell>{quota.programme_name}</TableCell>
                                            <TableCell>
                                                <Badge variant={quota.is_live ? "default" : "secondary"}>
                                                    {quota.status ? "Live" : "Draft"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {quota.applications_count || 0}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {quota.deadline_formatted}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('company.applications.show', quota.slug)}>
                                                        View <ChevronRight className="ml-2 size-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-slate-50/50">
                        <div className="p-3 bg-white rounded-full border mb-4 shadow-sm">
                            <LayoutGrid className="size-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No active applications</h3>
                        <p className="max-w-sm mt-1">There are currently no open recruitment cycles or applications to display.</p>
                    </div>
                )}
            </div>
        </>
    )
}

Applications.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />