import { useState } from 'react';
import { Input } from '@/Components/ui/input';

export interface StudentAssignmentOption {
    student_id: number;
    full_name: string;
    pb_student_code: string;
    company_id?: number;
    supervisor_id?: number | null;
}

export default function StudentAssignmentPicker({ students, value, onChange, supervisorId }: {
    students: StudentAssignmentOption[];
    value: number[];
    onChange: (ids: number[]) => void;
    supervisorId?: number;
}) {
    const [search, setSearch] = useState('');
    const filtered = students.filter((student) => `${student.full_name} ${student.pb_student_code}`.toLowerCase().includes(search.toLowerCase()));
    return <div className="space-y-2">
        <Input aria-label="Search recruited students" placeholder="Search student name or ID" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="max-h-56 overflow-y-auto rounded-lg border bg-white">
            {filtered.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted-foreground">No recruited students available.</p> : filtered.map((student) => {
                const assignedElsewhere = student.supervisor_id != null && Number(student.supervisor_id) !== supervisorId;
                return <label key={student.student_id} className={`flex items-center gap-3 border-b px-3 py-3 last:border-b-0 ${assignedElsewhere ? 'bg-slate-50 text-slate-600' : 'cursor-pointer hover:bg-slate-50'}`}>
                    <input type="checkbox" className="size-4 rounded border-slate-300 accent-blue-600" disabled={assignedElsewhere} checked={value.includes(student.student_id)} onChange={(event) => onChange(event.target.checked ? [...value, student.student_id] : value.filter((id) => id !== student.student_id))} />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{student.full_name}</span><span className="text-xs text-muted-foreground">{student.pb_student_code}</span></span>
                    {assignedElsewhere && <span className="text-xs">Already assigned</span>}
                </label>;
            })}
        </div>
        <p className="text-xs text-muted-foreground">{value.length} selected · Students can have one Industry Supervisor.</p>
    </div>;
}
