export const finalDecisionNotice = 'This decision cannot be changed by Company HR. Email Admin directly to request a change.';
export const decisionRuleNotice = 'Once you accept or decline a student, only Admin can change the decision. Email Admin directly to request a change.';

export const hasFinalApplicationDecision = (status: string) => ['Recruited', 'Approved', 'Declined'].includes(status);

export const canCompanyReviewApplication = (status: string) => status !== 'Cancelled' && !hasFinalApplicationDecision(status);
