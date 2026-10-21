import { roleLabel } from '@/lib/role-labels';

export type CompletionHistoryEntry = {
    id: number;
    action: string;
    actor: string;
    actor_role?: string | null;
    created_at?: string | null;
    previous_status?: string | null;
    current_status?: string | null;
    reason?: string | null;
    week_start?: string | null;
    week_end?: string | null;
    previous_decided_by?: string | null;
    previous_decided_at?: string | null;
};

const date = (value: string) => new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const statuses: Record<string, string> = { pending_fix: 'Corrections required', submitted: 'Awaiting review', approved: 'Approved', reviewed: 'Approved' };
const status = (value: string) => statuses[value] ?? value.replaceAll('_', ' ');

export default function InternshipCompletionHistory({ entries = [] }: { entries?: CompletionHistoryEntry[] }) {
    if (!entries.length) return null;

    return <details className="mt-5 border-t border-slate-200 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">Completion and correction history ({entries.length})</summary>
        <ol className="mt-3 divide-y divide-slate-100">
            {entries.map((entry) => <li key={entry.id} className="space-y-1 py-3 text-sm">
                <p className="font-medium text-slate-900">{entry.action}</p>
                <p className="text-xs leading-5 text-slate-500">{entry.actor}{entry.actor_role ? ` · ${roleLabel(entry.actor_role)}` : ''}{entry.created_at ? ` · ${date(entry.created_at)}` : ''}</p>
                {entry.week_start && entry.week_end && <p className="text-xs text-slate-500">Week: {entry.week_start.substring(0, 10)} – {entry.week_end.substring(0, 10)}</p>}
                {entry.current_status && <p className="text-slate-700">{entry.previous_status ? `${status(entry.previous_status)} → ` : ''}{status(entry.current_status)}</p>}
                {entry.previous_decided_at && <p className="text-xs leading-5 text-slate-500">Previous decision recorded{entry.previous_decided_by ? ` by ${entry.previous_decided_by}` : ''} on {date(entry.previous_decided_at)}.</p>}
                {entry.reason && <p className="whitespace-pre-line leading-6 text-slate-600">Reason: {entry.reason}</p>}
            </li>)}
        </ol>
    </details>;
}
