import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, CalendarDays, GraduationCap, Search, Users } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Input } from '@/Components/ui/input';
import { RecordFeedback } from '@/Components/Admin/RecordControls';
import { formatDate } from '@/Components/Admin/RecordView';

type Student = { student_id: number; full_name: string; pb_student_code: string; programme?: { programme_name: string }; internship?: { start_date: string; end_date: string } };
export default function StudentRecords({ students }: { students: Student[] }) {
    const [search, setSearch] = useState('');
    const filtered = students.filter((student) => [student.full_name, student.pb_student_code, student.programme?.programme_name].join(' ').toLowerCase().includes(search.toLowerCase()));
    return <AuthenticatedLayout><Head title="Student Records" /><RecordFeedback />
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Student Records</h1><p className="mt-2 text-sm text-slate-500">View student details and manage internship records.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"><Users className="size-4 text-blue-700" />{students.length} {students.length === 1 ? 'student' : 'students'}</div></header>
            <div className="relative max-w-lg"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" /><Input aria-label="Search student records" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, student code or programme…" className="pl-9" /></div>
            <Link href={route('admin.unplaced-students')} className="ui-button ui-button-outline inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">View unplaced students<ArrowRight className="size-4" /></Link>
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {!filtered.length ? <div className="px-6 py-12 text-center"><Users className="mx-auto size-10 text-slate-300" /><p className="mt-4 font-semibold text-slate-900">No students match your search.</p></div> : <div className="divide-y divide-slate-100">{filtered.map((student) => <div key={student.student_id} className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex min-w-0 items-center gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{(student.full_name || 'S').charAt(0).toUpperCase()}</span><div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{student.full_name}</h3><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500"><span>{student.pb_student_code}</span>{student.programme?.programme_name && <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-3.5" />{student.programme.programme_name}</span>}{student.internship && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{formatDate(student.internship.start_date)} – {formatDate(student.internship.end_date)}</span>}</div></div></div><Link href={route('admin.students.show', student.student_id)} className="ui-button ui-button-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90">View details<ArrowRight className="size-4" /></Link></div>)}</div>}
            </section>
        </div></main>
    </AuthenticatedLayout>;
}
