import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, History, RotateCcw, Search, Users } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RecordFeedback } from '@/Components/Admin/RecordControls';

type Student = { student_id: number; full_name: string; pb_student_code: string; district?: string; school?: string; programme?: string; active_application?: string; rejections: { id: number; company: string; position?: string; branch?: string; rejected_at: string; legacy_record: boolean }[] };
type Props = { students: { data: Student[]; total: number; links: { url: string | null; label: string; active: boolean }[] }; filters: { search?: string; school_id?: string; district?: string }; schools: { school_id: number; school_name: string; school_code: string }[]; districts: string[] };
export default function UnplacedStudents({ students, filters, schools, districts }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [school, setSchool] = useState(filters.school_id ?? '');
    const [district, setDistrict] = useState(filters.district ?? '');
    const hasActiveFilters = Boolean(search || school || district);
    const clearFilters = () => {
        setSearch('');
        setSchool('');
        setDistrict('');
        router.get(route('admin.unplaced-students'), {}, { preserveState: true, replace: true });
    };
    return <AuthenticatedLayout><Head title="Unplaced Students" /><RecordFeedback /><main className="space-y-6 p-6">
        <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold">Unplaced Students</h1><p className="mt-2 text-sm text-slate-500">Students who have not secured an internship placement.</p></div><span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"><Users className="size-4 text-blue-700" />{students.total} students</span></header>
        <form aria-label="Student filters" className="rounded-xl border border-slate-200 bg-white p-4" onSubmit={(event) => { event.preventDefault(); router.get(route('admin.unplaced-students'), { search, school_id: school, district }, { preserveState: true, preserveScroll: true, replace: true }); }}>
            <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_minmax(12rem,16rem)_minmax(10rem,12rem)_auto]">
                <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
                    <label htmlFor="unplaced-search" className="mb-1.5 block text-xs font-medium text-slate-600">Search students</label>
                    <div className="relative">
                        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input id="unplaced-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or student code..." className="ui-field h-10 w-full pl-9 pr-3" />
                    </div>
                </div>
                <div className="min-w-0">
                    <label htmlFor="unplaced-school" className="mb-1.5 block text-xs font-medium text-slate-600">School</label>
                    <select id="unplaced-school" value={school} onChange={(event) => setSchool(event.target.value)} className="ui-field h-10 w-full px-3"><option value="">All schools</option>{schools.map((item) => <option key={item.school_id} value={item.school_id}>{item.school_code} — {item.school_name}</option>)}</select>
                </div>
                <div className="min-w-0">
                    <label htmlFor="unplaced-district" className="mb-1.5 block text-xs font-medium text-slate-600">District</label>
                    <select id="unplaced-district" value={district} onChange={(event) => setDistrict(event.target.value)} className="ui-field h-10 w-full px-3"><option value="">All districts</option>{districts.map((item) => <option key={item}>{item}</option>)}</select>
                </div>
                <div className="flex items-center gap-2 xl:justify-end">
                    <button type="submit" className="ui-button ui-button-primary h-10 rounded-lg px-4 text-sm font-medium">Apply filters</button>
                    {hasActiveFilters && <button type="button" onClick={clearFilters} className="ui-button ui-button-ghost h-10 gap-1.5 px-3 text-sm text-slate-500 hover:text-primary"><RotateCcw aria-hidden="true" className="size-4" />Clear filters</button>}
                </div>
            </div>
        </form>
        <section className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{students.data.length === 0 ? <p className="p-12 text-center text-sm text-slate-500">No unplaced students match these filters.</p> : students.data.map((student) => <article key={student.student_id} className="p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-slate-900">{student.full_name}</h2><p className="mt-1 text-xs text-slate-500">{[student.pb_student_code, student.school, student.programme, student.district].filter(Boolean).join(' · ')}</p><p className="mt-2 text-xs font-medium text-amber-700">{student.active_application ? `Application: ${student.active_application}` : 'No active application'}</p></div><Link href={route('admin.students.show', student.student_id)} className="ui-button ui-button-outline inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">View details<ArrowRight className="size-4" /></Link></div><details className="mt-4 rounded-lg bg-slate-50 px-4 py-3"><summary className="cursor-pointer text-xs font-medium text-slate-600"><History className="mr-2 inline size-3.5" />Rejected application history ({student.rejections.length})</summary>{student.rejections.length ? <ul className="mt-3 space-y-3">{student.rejections.map((rejection) => <li key={rejection.id} className="text-xs text-slate-600"><span className="font-semibold text-slate-900">{rejection.company}</span> · {rejection.position}{rejection.branch ? ` · ${rejection.branch}` : ''}<span className="mt-1 block text-slate-500">{rejection.legacy_record ? 'Last recorded before history tracking: ' : 'Rejected: '}{new Date(rejection.rejected_at).toLocaleString()}</span></li>)}</ul> : <p className="mt-3 text-xs text-slate-500">No rejected applications.</p>}</details></article>)}</section>
        <nav aria-label="Pagination" className="flex flex-wrap gap-2">{students.links.map((link, index) => link.url ? <Link key={index} href={link.url} preserveScroll className={'ui-button ui-button-primary ' + (`rounded-lg border px-3 py-2 text-sm ${link.active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600'}`)}  dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>
    </main></AuthenticatedLayout>;
}
