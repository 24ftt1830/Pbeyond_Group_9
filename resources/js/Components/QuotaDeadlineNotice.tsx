export interface QuotaTerm {
    id?: number;
    name: string;
    company_label?: string;
    quota_deadline?: string | null;
    quota_deadline_label?: string | null;
    show_quota_deadline?: boolean;
}

export default function QuotaDeadlineNotice({ term, compact = false }: { term?: QuotaTerm | null; compact?: boolean }) {
    if (!term?.show_quota_deadline || !term.quota_deadline_label) return null;

    return <div className="text-xs leading-5 text-amber-800">
        <p className="font-medium">Deadline: {term.quota_deadline_label}</p>
        {!compact && <p>Pending requests expire after this date.</p>}
    </div>;
}
