import LogbookSubmission, { DayProps } from './LogbookSubmission';

export default function LogbookAttachments(props: DayProps) {
    return <LogbookSubmission {...props} permissionMode />;
}
