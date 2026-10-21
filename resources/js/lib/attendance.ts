export interface AttendanceSummary {
    percentage: number | null;
    credited_days: number;
    recorded_days: number;
    absent_days: number;
    missing_days: number;
    unapproved_days: number;
    elapsed_days: number;
    total_days: number;
    includes_future_days?: boolean;
    future_approved_days?: number;
}

export function attendanceLabel(attendance: Pick<AttendanceSummary, 'percentage' | 'elapsed_days' | 'total_days' | 'includes_future_days'>): string {
    if (attendance.percentage !== null) return `${attendance.percentage}%`;
    if (attendance.total_days === 0) return 'Internship dates not set';
    if (attendance.elapsed_days === 0 && !attendance.includes_future_days) return 'No internship days elapsed yet';
    return 'No approved attendance yet';
}

export function attendanceBasisLabel(attendance: Pick<AttendanceSummary, 'includes_future_days' | 'future_approved_days'>): string {
    if (attendance.includes_future_days) {
        const days = attendance.future_approved_days ?? 0;
        return `For demo: includes ${days} approved future ${days === 1 ? 'day' : 'days'}. The percentage uses credited days out of approved recorded days.`;
    }

    return 'The percentage uses credited days out of approved recorded days up to today.';
}
