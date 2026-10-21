import { confirmAction } from '@/lib/confirm-action';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ChevronDown, ClipboardList, FileText, FolderOpen, Info, LoaderCircle, MoreHorizontal, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { Button, type ButtonProps } from '@/Components/ui/button';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Switch } from '@/Components/ui/switch';
import { Badge, type BadgeProps } from '@/Components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Errors, RecordPanel } from '@/Components/Admin/RecordControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/Components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Calendar } from '@/Components/ui/calendar';
import { Skeleton } from '@/Components/ui/skeleton';
import { DataTable } from '@/Components/ui/data-table';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { UIReferenceItem } from '@/data/ui-reference-inventory';

// Keep source typography, colour and corners, while fitting the host preview.
// Positioning and visibility utilities from full pages must not escape a card.
function fittedClass(source: string) {
    return source.split(/\s+/).filter(token => token && !/^(?:(?:sm|md|lg|xl|2xl):)?(?:absolute|fixed|sticky|hidden|sr-only|invisible|contents|block$|flex-1|w-full|h-full|h-screen|min-h-screen|inset-|top-|bottom-|left-|right-|z-|col-span-|row-span-|translate-|-translate-|max-w-|min-w-|overflow-)/.test(token)).join(' ');
}

function ExampleTable({ plain = false }: { plain?: boolean }) {
    if (plain) return <table className="w-full text-left text-xs"><thead className="border-b bg-slate-50 text-slate-500"><tr><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Status</th></tr></thead><tbody><tr><td className="p-3">Demo student</td><td className="p-3">Pending</td></tr></tbody></table>;
    return <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Demo student</TableCell><TableCell>Pending</TableCell></TableRow></TableBody></Table>;
}

function ExampleChart({ variant }: { variant: string }) {
    const data = [{ name: 'SICT', placed: 8 }, { name: 'SBA', placed: 5 }, { name: 'SSE', placed: 7 }, { name: 'SHS', placed: 4 }];
    const axis = <><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis width={20} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /></>;
    return <div className="h-44 w-full min-w-0"><ResponsiveContainer width="100%" height="100%">{variant === 'PieChart' ? <PieChart><Pie data={data} dataKey="placed" innerRadius={32} outerRadius={58}>{data.map((entry, index) => <Cell key={entry.name} fill={['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', '#e2e8f0'][index]} />)}</Pie></PieChart> : variant === 'AreaChart' ? <AreaChart data={data}>{axis}<Area dataKey="placed" stroke="hsl(var(--primary))" fill="hsl(var(--accent))" /></AreaChart> : variant === 'LineChart' ? <LineChart data={data}>{axis}<Line dataKey="placed" stroke="hsl(var(--primary))" strokeWidth={2} /></LineChart> : variant === 'RadarChart' ? <RadarChart data={data}><PolarGrid /><PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} /><Radar dataKey="placed" stroke="hsl(var(--primary))" fill="hsl(var(--chart-2))" fillOpacity={0.4} /></RadarChart> : <BarChart data={data}>{axis}<Bar dataKey="placed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>}</ResponsiveContainer></div>;
}

export default function UIReferencePreview({ item }: { item: UIReferenceItem }) {
    const [checked, setChecked] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [legacyModal, setLegacyModal] = useState(false);
    const [result, setResult] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const style = fittedClass(item.className);
    const buttonWidth = style.match(/\bw-(\d+)\b/)?.[1];
    const iconOnly = /\bsize-\d+\b/.test(style) || Boolean(buttonWidth && style.match(/\bh-(\d+)\b/)?.[1] === buttonWidth);
    const action = () => setResult('Demo action completed.');
    const previewButton = (content: React.ReactNode) => <div className="flex w-full flex-col items-center gap-4"><div className="flex min-h-12 max-w-full items-center justify-center">{content}</div><label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-500"><input type="checkbox" className="rounded border-slate-300 text-indigo-600" checked={disabled} onChange={event => setDisabled(event.target.checked)} />Disabled state</label>{result && <span role="status" className="text-xs text-emerald-700">{result}</span>}</div>;

    switch (item.kind) {
        case 'button': return previewButton(<Button type="button" variant={item.variant as ButtonProps['variant']} size={item.size as ButtonProps['size']} className={style} disabled={disabled} onClick={action}>{item.size === 'icon' ? <Pencil aria-label="Edit demo" /> : 'Example action'}</Button>);
        case 'native-button': return previewButton(<button type="button" aria-label={iconOnly ? 'Example icon action' : undefined} className={style} disabled={disabled} onClick={action}>{iconOnly ? <Pencil size={16} /> : 'Example action'}</button>);
        case 'legacy-primary': return previewButton(<PrimaryButton type="button" disabled={disabled} onClick={action}>Save changes</PrimaryButton>);
        case 'legacy-secondary': return previewButton(<SecondaryButton disabled={disabled} onClick={action}>Cancel</SecondaryButton>);
        case 'legacy-danger': return previewButton(<DangerButton type="button" disabled={disabled} onClick={action}>Delete record</DangerButton>);
        case 'native-confirm': return <div className="space-y-3 text-center"><Button variant="outline" type="button" onClick={async () => setResult((await confirmAction('Confirm this demonstration? This example only updates the preview.')) ? 'Confirmed.' : 'Cancelled.')}>Open confirmation</Button>{result && <p role="status" className="text-xs text-slate-500">{result}</p>}</div>;
        case 'alert-dialog': return <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="outline">Open confirmation</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{item.name}: confirm this action?</AlertDialogTitle><AlertDialogDescription>This is the website's styled confirmation dialog. This demonstration only changes the preview.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toast.success(`${item.name}: demo confirmed.`)}>Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
        case 'dialog': return <Dialog><DialogTrigger asChild><Button type="button" variant="outline">Open form dialog</Button></DialogTrigger><DialogContent className={item.className}><DialogHeader><DialogTitle>{item.name}: edit demo record</DialogTitle><DialogDescription>Example fields inside the existing dialog component.</DialogDescription></DialogHeader><div className="space-y-2 py-3"><label htmlFor={`${item.id}-name`} className="text-sm font-medium">Name</label><Input id={`${item.id}-name`} defaultValue="Demo student" /></div><DialogFooter><Button type="button" onClick={() => toast.success('Demo form action selected.')}>Save example</Button></DialogFooter></DialogContent></Dialog>;
        case 'legacy-modal': return <><Button type="button" variant="outline" onClick={() => setLegacyModal(true)}>Open account modal</Button><Modal show={legacyModal} maxWidth="lg" onClose={() => setLegacyModal(false)}><div className="p-6"><h2 className="text-lg font-medium text-gray-900">Confirm account action</h2><p className="mt-2 text-sm text-gray-600">This is an example of the account modal.</p><TextInput type="password" aria-label="Demo password" placeholder="Password" className="mt-5 w-full" /><div className="mt-6 flex justify-end gap-3"><SecondaryButton onClick={() => setLegacyModal(false)}>Cancel</SecondaryButton><DangerButton type="button" onClick={() => { setLegacyModal(false); toast.success('Account modal demonstration completed.'); }}>Confirm example</DangerButton></div></div></Modal></>;
        case 'toast': return <div className="space-y-3 text-center"><Button type="button" variant="outline" onClick={() => {
            const show = item.variant === 'success' ? toast.success : item.variant === 'error' ? toast.error : item.variant === 'warning' ? toast.warning : item.variant === 'loading' ? toast.loading : toast.info;
            show(`${item.name}: ${item.variant === 'success' ? 'Your changes have been saved.' : item.variant === 'error' ? 'The action could not be completed.' : 'Please review this information.'}`, {
                ...(item.value ? { description: 'UI Reference demonstration' } : {}),
                ...(item.value === 'action' ? { action: { label: 'View example', onClick: () => setResult('Demo notification action selected.') } } : {}),
                duration: 3000,
            });
        }}>Show {item.variant} toast</Button><p className="text-xs text-slate-500">Uses the current website toaster.</p>{result && <p role="status" className="text-xs text-emerald-700">{result}</p>}</div>;
        case 'alert': return <Alert variant={item.variant === 'destructive' ? 'destructive' : 'default'} className={style}><Info className="h-4 w-4" /><AlertTitle>Action required</AlertTitle><AlertDescription>Review the details before continuing.</AlertDescription></Alert>;
        case 'errors': return <Errors errors={{ example: 'Complete the required fields before saving.' }} />;
        case 'field-error': return <div className="w-full"><Input aria-label="Field with example error" placeholder="Email address" /><InputError message="Enter a valid email address." className="mt-2" /></div>;
        case 'saved': return <span className="text-sm text-gray-600">Saved.</span>;
        case 'notice': return <div role="status" className={style || 'rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'}>Your record needs attention. Review the details to continue.</div>;
        case 'input': return <Input aria-label={`${item.name} example`} className={style} placeholder="Enter an example value" />;
        case 'text-input': return <TextInput aria-label={`${item.name} example`} className={`w-full ${style}`} placeholder="Enter an example value" />;
        case 'textarea': return <Textarea aria-label={`${item.name} example`} className={style} rows={3} placeholder="Write a description…" />;
        case 'native-input': return <input aria-label={`${item.name} example`} className={style || 'w-full rounded-md border-slate-300 text-sm'} type={['text', 'email', 'password', 'date', 'datetime-local', 'number', 'search', 'tel', 'url', 'time'].includes(item.value) ? item.value : 'text'} placeholder="Example value" />;
        case 'native-select': return <select aria-label={`${item.name} example`} className={style || 'w-full rounded-md border-slate-300 text-sm'} defaultValue=""><option value="" disabled>Select an option</option><option>Option one</option><option>Option two</option></select>;
        case 'select': return <Select><SelectTrigger className={style} aria-label={`${item.name} example`}><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent><SelectItem value="one">Option one</SelectItem><SelectItem value="two">Option two</SelectItem></SelectContent></Select>;
        case 'checkbox': return <label className="flex items-center gap-3 text-sm text-slate-600"><Checkbox className={style} checked={checked} onCheckedChange={value => setChecked(value === true)} />Example checkbox</label>;
        case 'native-checkbox': return <label className="flex items-center gap-3 text-sm text-slate-600"><input type="checkbox" className={style} checked={checked} onChange={event => setChecked(event.target.checked)} />Example checkbox</label>;
        case 'switch': return <label className="flex items-center gap-3 text-sm text-slate-600"><Switch className={style} checked={checked} onCheckedChange={setChecked} />Enable example</label>;
        case 'file': return <div className="w-full space-y-2"><input type="file" aria-label={`${item.name} example`} className={`${style} max-w-full text-sm`} /><p className="text-xs text-slate-500">Selected locally for preview only.</p></div>;
        case 'calendar': return <Popover><PopoverTrigger asChild><Button type="button" variant="outline">{date ? date.toLocaleDateString() : 'Open calendar'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent></Popover>;
        case 'badge': return <Badge variant={item.variant as BadgeProps['variant']} className={style}>Pending</Badge>;
        case 'native-badge': return <span className={style}>Example status</span>;
        case 'record-panel': return <div className="w-full"><RecordPanel title="Student record"><p className="text-sm text-slate-500">Example information inside the panel.</p></RecordPanel></div>;
        case 'card': return <Card className={`w-full ${style}`}><CardHeader className="p-4"><CardTitle className="text-sm">Student details</CardTitle><CardDescription>Example section description.</CardDescription></CardHeader><CardContent className="px-4 pb-4 text-sm text-slate-500">Details appear here.</CardContent></Card>;
        case 'native-card': return <section className={`${style} w-full`}><h3 className="text-sm font-semibold text-slate-900">Section title</h3><p className="mt-2 text-sm text-slate-500">Example content inside this existing panel style.</p></section>;
        case 'tabs': case 'animated-tabs': return <Tabs defaultValue="all" className="w-full"><TabsList className={style}><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="pending">Pending</TabsTrigger></TabsList><TabsContent value="all" className="pt-2 text-xs text-slate-500">All example records.</TabsContent><TabsContent value="pending" className="pt-2 text-xs text-slate-500">Pending example records.</TabsContent></Tabs>;
        case 'dropdown': return <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="outline" size="icon" aria-label="Open example actions"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent className={item.className} align="end"><DropdownMenuItem onSelect={() => setResult('Edit selected.')}><Pencil className="mr-2 h-4 w-4" />Edit record</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-rose-600" onSelect={() => setResult('Delete selected in the demo.')}><Trash2 className="mr-2 h-4 w-4" />Delete record</DropdownMenuItem></DropdownMenuContent>{result && <p role="status" className="ml-3 text-xs text-slate-500">{result}</p>}</DropdownMenu>;
        case 'popover': return <Popover><PopoverTrigger asChild><Button type="button" variant="outline">Open popover<ChevronDown /></Button></PopoverTrigger><PopoverContent><p className="text-sm font-medium">Filter records</p><p className="mt-2 text-sm text-slate-500">Example content in the existing popover.</p></PopoverContent></Popover>;
        case 'tooltip': return <TooltipProvider><Tooltip><TooltipTrigger asChild><Button type="button" variant="outline" size="icon" aria-label="Hover for example tooltip"><Info /></Button></TooltipTrigger><TooltipContent>Example helper text</TooltipContent></Tooltip></TooltipProvider>;
        case 'pagination': return <div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => setChecked(false)}>Previous</Button><span className="text-sm text-slate-500">{checked ? 2 : 1} / 2</span><Button size="sm" variant="outline" onClick={() => setChecked(true)}>Next</Button></div>;
        case 'sidebar': return <div className="w-full space-y-1 rounded-lg border border-slate-200 bg-white p-2"><button type="button" className="flex w-full items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-left text-sm text-primary"><ClipboardList size={16} />Active page</button><button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-500"><Users size={16} />Other page</button></div>;
        case 'data-table': return <div className="w-full overflow-x-auto"><DataTable columns={[{ accessorKey: 'name', header: 'Student' }, { accessorKey: 'status', header: 'Status' }]} data={[{ name: 'Demo student', status: 'Pending' }]} /></div>;
        case 'table': return <div className="w-full overflow-x-auto"><ExampleTable plain={item.title === 'Native HTML table'} /></div>;
        case 'empty': return <div className={style || 'w-full rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500'}>No records found.</div>;
        case 'skeleton': return <div className="w-full space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>;
        case 'spinner': return <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-primary" />Loading…</div>;
        case 'chart': return <ExampleChart variant={item.variant} />;
        case 'progress': return <div className="w-full"><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Completion</span><span>60%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 w-3/5 rounded-full bg-primary" /></div></div>;
        case 'heading': return <div className={`${style} break-words`}>Page heading</div>;
        case 'image': return <img src={item.value} alt={item.title} className="max-h-20 max-w-full object-contain" />;
        case 'avatar': return <div className="flex items-center gap-3"><Avatar><AvatarFallback>DS</AvatarFallback></Avatar><span className="text-sm text-slate-600">Demo student</span></div>;
        case 'icons': return <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">{[Users, FileText, Search, Plus, Pencil, Trash2, CheckCircle2, FolderOpen].map((Icon, index) => <Icon key={index} size={22} />)}</div>;
        default: return <div className="text-sm text-slate-500">Example pattern</div>;
    }
}
