import { AlertCircle } from 'lucide-react';

export type PendingLogbookCorrection = {
    id: number;
    week_start: string;
    week_end: string;
    status: string;
    reopen_reason?: string | null;
    reopened_at?: string | null;
};

const date = (value: string) => new Date(`${value.substring(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function LogbookCorrectionNotice({ weeks = [] }: { weeks?: PendingLogbookCorrection[] }) {
    if (!weeks.length) return null;

    return <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Logbook correction pending</h2>
                <p className="mt-1 leading-6">The student must correct and resubmit each reopened week for approval. PB Supervisor can confirm completion again after the correction is approved.</p>
                <ul className="mt-3 space-y-2">
                    {weeks.map((week) => <li key={week.id}>
                        <p className="font-medium">{date(week.week_start)} – {date(week.week_end)} · {['submitted', 'pending'].includes(week.status) ? 'Awaiting review' : 'Corrections required'}</p>
                        {week.reopen_reason && <p className="mt-0.5 whitespace-pre-line leading-6">Reason: {week.reopen_reason}</p>}
                    </li>)}
                </ul>
                <p className="mt-3 text-xs leading-5">Existing report marks, supervisor evaluations and company confirmation are retained.</p>
            </div>
        </div>
    </section>;
}
