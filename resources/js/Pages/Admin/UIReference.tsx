import { useEffect, useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Clipboard, Component, Layers3, Search, SlidersHorizontal, X } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import UIReferencePreview from '@/Components/UIReferencePreview';
import { uiInventory, type UIReferenceItem } from '@/data/ui-reference-inventory';

const PAGE_SIZE = 18;
const roleOptions = ['Admin', 'Company', 'Student', 'PB Supervisor', 'Industry Supervisor', 'Shared', 'Public / sign-in'];

function ReferenceCard({ item }: { item: UIReferenceItem }) {
    const [copied, setCopied] = useState(false);
    async function copyName() {
        try {
            await navigator.clipboard.writeText(`${item.name} — ${item.title}`);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }
    return <article id={item.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="min-w-0"><p className="text-xs font-semibold text-indigo-600">{item.name}</p><h3 className="mt-1 text-sm font-semibold leading-5 text-slate-900">{item.title}</h3></div>
            <button type="button" aria-label={`Copy ${item.name}`} title={copied ? 'Copied' : 'Copy type name'} onClick={copyName} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">{copied ? <Check size={15} className="text-emerald-600" /> : <Clipboard size={15} />}</button>
        </div>
        <div className="flex min-h-40 min-w-0 flex-1 items-center justify-center border-b border-slate-100 bg-slate-50/40 p-5"><UIReferencePreview item={item} /></div>
        <div className="space-y-3 p-5">
            <p className="text-xs leading-5 text-slate-500">{item.description}</p>
            <div className="flex flex-wrap gap-1.5">{item.roles.map(role => <span key={role} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{role}</span>)}</div>
            <details className="group border-t border-slate-100 pt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-slate-600 [&::-webkit-details-marker]:hidden"><span>Used in {item.sources.length} file{item.sources.length === 1 ? '' : 's'} · {item.occurrences} occurrence{item.occurrences === 1 ? '' : 's'}</span><ChevronDown size={14} className="shrink-0 transition group-open:rotate-180" /></summary>
                <ul className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">{item.sources.map(source => <li key={source.file} className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="break-all font-mono text-[10px] leading-4 text-slate-500">{source.file}:{source.line}</p>
                    {source.pages.length ? <div className="flex flex-wrap gap-1.5">{source.pages.map(page => page.href ? <Link key={page.name} href={page.href} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline">{page.name}<ArrowUpRight size={11} /></Link> : <span key={page.name} className="text-[11px] text-slate-500">{page.name}</span>)}</div> : <p className="text-[11px] text-slate-500">Component source</p>}
                </li>)}</ul>
                {item.className && <div className="mt-3"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Source styles</p><code className="block max-h-24 overflow-y-auto break-all rounded-md bg-slate-50 p-2 text-[10px] leading-4 text-slate-500">{item.className}</code></div>}
            </details>
        </div>
    </article>;
}

export default function UIReference() {
    const [category, setCategory] = useState('buttons');
    const [role, setRole] = useState('all');
    const [query, setQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const categoryCounts = useMemo(() => new Map(uiInventory.categories.map(group => [group.id, uiInventory.items.filter(item => item.category === group.id).length])), []);
    const currentCategory = uiInventory.categories.find(group => group.id === category);
    const filtered = useMemo(() => {
        const search = query.toLowerCase().trim();
        return uiInventory.items.filter(item => (category === 'all' || item.category === category)
            && (role === 'all' || item.roles.includes(role))
            && (!search || `${item.name} ${item.title} ${item.description} ${item.className} ${item.roles.join(' ')} ${item.sources.map(source => source.file).join(' ')}`.toLowerCase().includes(search)));
    }, [category, role, query]);
    useEffect(() => setVisibleCount(PAGE_SIZE), [category, role, query]);
    const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Brunei' }).format(new Date(uiInventory.scannedAt));
    function clearFilters() { setCategory('all'); setRole('all'); setQuery(''); }

    return <AuthenticatedLayout><Head title="UI Reference" />
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div><div className="mb-2 flex items-center gap-2"><span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">Temporary reference</span><span className="text-xs text-slate-400">Snapshot · {date}</span></div><h1 className="font-sato text-3xl font-bold tracking-tight text-slate-900">UI Reference</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Compare the styles currently found across PBeyond. Use each type name when choosing what to keep or remodel.</p></div>
            </header>

            <section aria-label="Inventory summary" className="grid gap-4 sm:grid-cols-3">{[
                { label: 'Catalogued variants', value: uiInventory.items.length, icon: Component },
                { label: 'Categories', value: uiInventory.categories.filter(group => categoryCounts.get(group.id)).length, icon: Layers3 },
                { label: 'Source files scanned', value: uiInventory.scannedFiles, icon: SlidersHorizontal },
            ].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p></div><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon size={20} /></span></div>)}</section>

            <div className="grid items-start gap-6 xl:grid-cols-[210px_minmax(0,1fr)]">
                <nav aria-label="UI categories" className="xl:sticky xl:top-4"><div className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible"><button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')} className={`flex shrink-0 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm transition ${category === 'all' ? 'bg-slate-900 font-medium text-white' : 'text-slate-600 hover:bg-slate-100'}`}><span>All categories</span><span className={`text-xs tabular-nums ${category === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>{uiInventory.items.length}</span></button>{uiInventory.categories.filter(group => categoryCounts.get(group.id)).map(group => <button key={group.id} type="button" aria-pressed={category === group.id} onClick={() => setCategory(group.id)} className={`flex shrink-0 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm transition ${category === group.id ? 'bg-slate-900 font-medium text-white' : 'text-slate-600 hover:bg-slate-100'}`}><span className="whitespace-nowrap">{group.title}</span><span className={`text-xs tabular-nums ${category === group.id ? 'text-slate-300' : 'text-slate-400'}`}>{categoryCounts.get(group.id)}</span></button>)}</div><p className="mt-4 hidden text-xs leading-5 text-slate-400 xl:block">Counts include size, colour and page-specific class variations. Expand a card to see where it is used.</p></nav>

                <div className="min-w-0 space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><Input value={query} onChange={event => setQuery(event.target.value)} className="h-10 bg-white pl-9 pr-9" aria-label="Search UI variants" placeholder="Search type, page, colour or component…" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"><X size={15} /></button>}</div><select aria-label="Filter by role" value={role} onChange={event => setRole(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 sm:w-48"><option value="all">All roles</option>{roleOptions.map(option => <option key={option}>{option}</option>)}</select></div>
                    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-base font-semibold text-slate-900">{currentCategory?.title ?? 'All categories'}</h2><p aria-live="polite" className="mt-1 text-xs text-slate-500">{filtered.length} matching variant{filtered.length === 1 ? '' : 's'} · Previews use example content.</p></div>{(query || role !== 'all') && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"><X size={13} />Clear filters</button>}</div>
                    {filtered.length ? <div className="grid items-start gap-4 md:grid-cols-2">{filtered.slice(0, visibleCount).map(item => <ReferenceCard key={item.id} item={item} />)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"><Search size={25} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No matching variants</p><p className="mt-1 text-xs text-slate-500">Try another category, role or search term.</p><Button type="button" variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Clear filters</Button></div>}
                    {filtered.length > visibleCount && <div className="flex justify-center"><Button type="button" variant="outline" onClick={() => setVisibleCount(value => value + PAGE_SIZE)}><ArrowDown size={15} />Show {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more<span className="text-xs text-slate-400">({visibleCount} / {filtered.length})</span></Button></div>}
                    <details className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500"><summary className="cursor-pointer font-medium text-slate-600">About this inventory</summary><div className="mt-3 space-y-2 leading-5"><p>A variant is a component and its size/style combination. Different conditional styles appear separately. Counts describe source occurrences, including shared components; they are not counts of individual rendered records.</p><p>Examples keep the existing components or source classes with sample content fitted to each preview. Demo actions, uploads and confirmations stay within this page.</p><p>The source scan excludes UI primitive internals and this reference page. It is a snapshot, rather than a live count. Refresh it after UI changes with <code className="break-all rounded bg-slate-50 px-1 py-0.5 font-mono text-[11px]">node scripts/generate-ui-reference.mjs</code>.</p></div></details>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>;
}
