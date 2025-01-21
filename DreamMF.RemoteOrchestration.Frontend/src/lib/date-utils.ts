export function formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(d);
}

export function formatDateShort(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(d);
}

export function formatDateFull(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).format(d);
}
