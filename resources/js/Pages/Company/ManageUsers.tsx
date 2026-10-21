import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Loader2, Users, UserRoundCheck } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import StudentAssignmentPicker from '@/Components/StudentAssignmentPicker';

interface Student {
    student_id: number;
    full_name: string;
    pb_student_code: string;
    supervisor_assignments?: { supervisor_id: number }[];
}
interface IndustrySupervisor {
    supervisor_id: number;
    full_name: string;
    email: string;
    phone?: string;
    students?: Student[];
    user?: { username: string; email: string };
}
interface Props {
    industrySupervisors: IndustrySupervisor[];
    students: Student[];
}

export default function ManageUsers({ industrySupervisors = [], students = [] }: Props) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<IndustrySupervisor | null>(null);
    const form = useForm({ username: '', email: '', password: '', full_name: '', phone: '', student_ids: [] as number[] });
    const assignment = useForm({ student_ids: [] as number[] });
    const options = students.map((student) => ({ ...student, supervisor_id: student.supervisor_assignments?.[0]?.supervisor_id }));
    return <AuthenticatedLayout>
        <Head title="Manage Users" />
        <div className="space-y-6 p-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="font-sans text-3xl font-semibold">Manage Users</h1><p className="mt-1 text-sm text-muted-foreground">Manage Industry Supervisors and assign recruited students.</p></div>
                <Button size="sm" className="gap-1.5" onClick={() => { form.reset(); form.clearErrors(); setOpen(true); }}><Plus className="size-4" />Add User</Button>
            </header>
            {industrySupervisors.length === 0 ? <div className="rounded-xl border bg-white py-12 text-center"><Users className="mx-auto size-8 text-slate-400" /><p className="mt-3 text-sm text-muted-foreground">No Industry Supervisors yet.</p></div> :
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{industrySupervisors.map((supervisor) => <Card key={supervisor.supervisor_id} className="shadow-none">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="size-5 text-slate-600" />{supervisor.full_name}</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p><span className="font-medium text-foreground">Username:</span> {supervisor.user?.username ?? 'Not provided'}</p>
                        <p><span className="font-medium text-foreground">Email:</span> {supervisor.user?.email ?? supervisor.email}</p>
                        <p><span className="font-medium text-foreground">Phone:</span> {supervisor.phone ?? 'Not provided'}</p>
                        <div className="border-t pt-3"><p className="font-medium text-foreground">{supervisor.students?.length ?? 0} assigned students</p>
                            {supervisor.students?.map((student) => <p className="mt-1 text-xs" key={student.student_id}>{student.full_name} · {student.pb_student_code}</p>)}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={() => { assignment.setData('student_ids', supervisor.students?.map((student) => student.student_id) ?? []); assignment.clearErrors(); setSelected(supervisor); }}><UserRoundCheck className="size-4" />Manage students</Button>
                    </CardContent>
                </Card>)}</div>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
            <DialogHeader><DialogTitle>Add Industry Supervisor</DialogTitle><DialogDescription>Create an account and select students from your recruited interns.</DialogDescription></DialogHeader>
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); form.post(route('company.manage-users.store'), { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } }); }}>
                <div className="grid gap-4 sm:grid-cols-2">{(['full_name', 'username', 'email', 'password', 'phone'] as const).map((field) => <div key={field} className="space-y-2">
                    <Label htmlFor={'supervisor-' + field}>{({ full_name: 'Full name', username: 'Username', email: 'Email', password: 'Password', phone: 'Phone (optional)' })[field]}</Label>
                    <Input id={'supervisor-' + field} required={field !== 'phone'} type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} minLength={field === 'password' ? 8 : undefined} value={form.data[field]} onChange={(event) => form.setData(field, event.target.value)} />
                    {form.errors[field] && <p className="text-xs text-red-600">{form.errors[field]}</p>}
                </div>)}</div>
                <div className="space-y-2"><Label>Assign students (optional)</Label><StudentAssignmentPicker students={options} value={form.data.student_ids} onChange={(ids) => form.setData('student_ids', ids)} /></div>
                {form.errors.student_ids && <p role="alert" className="text-sm text-red-600">{form.errors.student_ids}</p>}
                <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={form.processing}>{form.processing ? <Loader2 className="size-4 animate-spin" /> : 'Create user'}</Button></DialogFooter>
            </form>
        </DialogContent></Dialog>
        <Dialog open={selected !== null} onOpenChange={(value) => { if (!value) setSelected(null); }}><DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>Assign students</DialogTitle><DialogDescription>Manage students supervised by {selected?.full_name}.</DialogDescription></DialogHeader>
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (selected) assignment.put(route('company.manage-users.assignments', selected.supervisor_id), { preserveScroll: true, onSuccess: () => setSelected(null) }); }}>
                <StudentAssignmentPicker students={options} value={assignment.data.student_ids} onChange={(ids) => assignment.setData('student_ids', ids)} supervisorId={selected?.supervisor_id} />
                {assignment.errors.student_ids && <p role="alert" className="text-sm text-red-600">{assignment.errors.student_ids}</p>}
                <DialogFooter><Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button type="submit" disabled={assignment.processing}>{assignment.processing ? 'Saving…' : 'Save assignments'}</Button></DialogFooter>
            </form>
        </DialogContent></Dialog>
    </AuthenticatedLayout>;
}
