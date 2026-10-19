import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, GraduationCap, Search, Users, UserPlus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

interface Student {
    student_id: number;
    pb_student_code: string;
    full_name: string;
    programme?: { programme_name?: string; school?: { school_code: string; school_name: string } };
}
interface Props {
    students: Student[];
    availableStudents: Student[];
    schools: { school_id: number; school_code: string; school_name: string }[];
    filters: { school_id?: string; search?: string };
}

export default function Students({ students = [], availableStudents = [], schools = [], filters = {} }: Props) {
    const filter = useForm({ school_id: String(filters.school_id ?? ''), search: filters.search ?? '' });
    const claim = useForm({ student_id: 0 });
    return (
        <AuthenticatedLayout>
            <Head title="My Students" />
            <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <header className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Students</h1>
                            <p className="mt-2 text-sm text-slate-500">Manage your students and choose students to supervise.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
                            <Users className="size-4 text-blue-700" />{students.length} assigned
                        </span>
                    </header>
                    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); filter.get(route('academic-supervisor.students'), { preserveState: true, preserveScroll: true }); }}>
                        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><Input className="bg-white pl-9" placeholder="Search student name or ID" value={filter.data.search} onChange={(event) => filter.setData('search', event.target.value)} /></div>
                        <select aria-label="Filter by school" className="h-10 rounded-md border bg-white px-3 text-sm sm:max-w-xs" value={filter.data.school_id} onChange={(event) => filter.setData('school_id', event.target.value)}>
                            <option value="">All schools</option>
                            {schools.map((school) => <option key={school.school_id} value={school.school_id}>{school.school_code} — {school.school_name}</option>)}
                        </select>
                        <Button type="submit" disabled={filter.processing}>Search</Button>
                    </form>
                    {claim.errors.student_id && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{claim.errors.student_id}</p>}
                    {([
                        { title: 'Your students', description: 'View student details, attendance, visits and progress.', list: students, available: false },
                        { title: 'Available students', description: 'Choose an unassigned student to become their PB Supervisor.', list: availableStudents, available: true },
                    ]).map((section) => (
                        <section key={section.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <h2 className="font-semibold text-slate-900">{section.title} <span className="ml-2 text-xs font-normal text-slate-500">{section.list.length}</span></h2>
                                <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                            </div>
                            {section.list.length === 0 ? <div className="px-6 py-10 text-center text-sm text-slate-500">{section.available ? 'No unassigned students match your search.' : 'No assigned students match your search.'}</div> : <div className="divide-y divide-slate-100">
                                {section.list.map((student) => <div key={student.student_id} className="flex flex-col gap-4 px-5 py-4 hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div className="flex min-w-0 items-center gap-4">
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{student.full_name.charAt(0).toUpperCase()}</span>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900">{student.full_name}</h3>
                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                <span>{student.pb_student_code}</span>
                                                <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-3.5" />{student.programme?.programme_name ?? 'Programme not assigned'}</span>
                                                {student.programme?.school && <span>{student.programme.school.school_code}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {section.available ? <Button type="button" variant="outline" className="gap-2" disabled={claim.processing} onClick={() => { claim.transform(() => ({ student_id: student.student_id })); claim.post(route('academic-supervisor.students.assign'), { preserveScroll: true }); }}><UserPlus className="size-4" />Supervise student</Button> :
                                        <Link href={route('academic-supervisor.student.show', student.student_id)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">View details<ArrowRight className="size-4" /></Link>}
                                </div>)}
                            </div>}
                        </section>
                    ))}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
