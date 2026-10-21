import { CalendarClock } from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function LogbookTestingNotice() {
    return <Alert role="note">
        <CalendarClock className="size-4" aria-hidden="true" />
        <AlertDescription>Local demo: future entries, submissions, Industry SV approvals and early CSV downloads are enabled. Attendance includes approved future logbook days. Earlier weeks still need approval.</AlertDescription>
    </Alert>;
}
