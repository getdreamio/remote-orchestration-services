import { isValid, parseISO, format } from 'date-fns';

export const formatDate = (date: string | Date | null | undefined): unknown => {
    if (date === undefined || !date || date === '') return '';
    try {
        if (isValid(date)) {
            return format(date, 'yyyy-MM-dd HH:mm:ss');
        }
    } catch {
        return '';
    }
};
