export const roleLabel = (value: string | null | undefined): string => (value ?? '')
    .replace(/Academic Supervisor/g, 'PB Supervisor')
    .replace(/Academic supervisor/g, 'PB Supervisor')
    .replace(/academic supervisor/g, 'PB supervisor')
    .replace(/Academic SV/g, 'PB SV');
