import { LockKeyhole } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { decisionRuleNotice, finalDecisionNotice } from '@/lib/application-review';

export default function DecisionNotice({ locked = false }: { locked?: boolean }) {
    return <Alert role="note">
        <LockKeyhole className="size-4" aria-hidden="true" />
        <AlertTitle>{locked ? 'Decision locked' : 'Accepting or declining is final for Company HR'}</AlertTitle>
        <AlertDescription>{locked ? finalDecisionNotice : decisionRuleNotice}</AlertDescription>
    </Alert>;
}
