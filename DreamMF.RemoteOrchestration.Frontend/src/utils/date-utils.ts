import { isValid, parseISO, format } from 'date-fns';

export const formatDate = (date: string | Date | null | undefined): any => {
    if (!date || date === '') return '';
    try {
        if (isValid(parseISO(date))) {
            return format(parseISO(date), 'yyyy-MM-dd HH:mm:ss');
        }
    } catch {
        return '';
    }
};
