import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MoreHorizontal, Eye, MessageCircle } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/Components/ui/dropdown-menu";
import { 
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from "@/Components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function Show({ quota, applications }: { quota: any, applications: any[] }) {
    const { auth } = usePage<any>().props; // Get auth from inertia props
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const updateStatus = (applicationId: number, status: string) => {
        router.post(route('company.applications.update-status', applicationId), 
            { status }, 
            { preserveScroll: true }
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Recruited': return 'bg-green-500';
            case 'Waitlisted': return 'bg-yellow-500';
            case 'Declined': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Job Applications</h2>}
        >
            <Head title={`Applicants - ${quota.job_title}`} />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">{quota.job_title}</h1>
                    <p className="text-muted-foreground mt-1">Managing {applications.length} applicants.</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>List of Applicants</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Programme</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.student.full_name}</TableCell>
                                        <TableCell>{app.student.programme?.programme_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Badge className={`cursor-pointer ${getStatusColor(app.status)}`}>
                                                        {app.status || 'Pending'}
                                                    </Badge>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => updateStatus(app.id, 'Waitlisted')}>Waitlist</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus(app.id, 'Recruited')}>Recruit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus(app.id, 'Declined')}>Decline</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(app.created_at).toLocaleString(undefined, { 
                                                dateStyle: 'short', timeStyle: 'short' 
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => alert('Feature: Remark')}>
                                                        <MessageCircle className="w-4 h-4 mr-2" /> Remark
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSelectedStudent(app.student)}>
                                                        <Eye className="w-4 h-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Student Details</SheetTitle>
                        <SheetDescription>View comprehensive profile information.</SheetDescription>
                    </SheetHeader>
                    {selectedStudent && (
                        <div className="mt-6 space-y-4">
                            <div><p className="text-sm text-muted-foreground">Full Name</p><p className="font-medium">{selectedStudent.full_name}</p></div>
                            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedStudent.email}</p></div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}