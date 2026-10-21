import { confirmAction } from '@/lib/confirm-action';
import { Plus, Trash2 } from 'lucide-react';

export type CompanyBranch = { id?: number; name: string; address: string; district: string };
export const districts = ['Brunei-Muara', 'Belait', 'Tutong', 'Temburong', 'Overseas'];
const inputClass = 'ui-field';

export default function CompanyBranchEditor({ branches, onChange, errors = {} }: { branches: CompanyBranch[]; onChange: (branches: CompanyBranch[]) => void; errors?: Record<string, string> }) {
    const update = (index: number, values: Partial<CompanyBranch>) => onChange(branches.map((branch, position) => position === index ? { ...branch, ...values } : branch));
    return <section className="space-y-4 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between gap-4"><div><h3 className="text-sm font-semibold text-slate-900">Company branches</h3><p className="mt-1 text-xs text-slate-500">Choose which branches are offered when creating a position.</p></div><button type="button" onClick={() => onChange([...branches, { name: '', address: '', district: '' }])} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><Plus className="size-4" />Add branch</button></div>
        {errors.branches && <p className="text-sm text-rose-600">{errors.branches}</p>}
        {branches.map((branch, index) => <div key={branch.id ?? `new-${index}`} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Branch {index + 1}</span><button type="button" disabled={branches.length <= 1} title="Remove branch" aria-label={`Remove branch ${index + 1}`} className="rounded p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30" onClick={async () => { if ((await confirmAction('Remove this branch? Branches used by positions or applications cannot be removed.'))) onChange(branches.filter((_, position) => position !== index)); }}><Trash2 className="size-4" /></button></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm">Branch name<input className={'ui-field ' + (inputClass)}  value={branch.name} onChange={(event) => update(index, { name: event.target.value })} required />{errors[`branches.${index}.name`] && <span className="text-xs text-rose-600">{errors[`branches.${index}.name`]}</span>}</label><label className="space-y-1.5 text-sm">District<select className={'ui-field ' + (inputClass)}  value={branch.district ?? ''} onChange={(event) => update(index, { district: event.target.value })} required><option value="">Select district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>{errors[`branches.${index}.district`] && <span className="text-xs text-rose-600">{errors[`branches.${index}.district`]}</span>}</label></div>
            <label className="block space-y-1.5 text-sm">Address<input className={'ui-field ' + (inputClass)}  value={branch.address ?? ''} onChange={(event) => update(index, { address: event.target.value })} required />{errors[`branches.${index}.address`] && <span className="text-xs text-rose-600">{errors[`branches.${index}.address`]}</span>}</label>
        </div>)}
    </section>;
}
