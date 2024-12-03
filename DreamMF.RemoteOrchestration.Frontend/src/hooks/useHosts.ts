import { useSuspenseQuery } from '@tanstack/react-query';
import type { Host } from '@/types/host';

const fetchHosts = async (): Promise<Host[]> => {
    const response = await fetch('/api/hosts');
    if (!response.ok) {
        throw new Error('Failed to fetch hosts');
    }
    return response.json();
};

export const useHosts = () => {
    return useSuspenseQuery<Host[]>({
        queryKey: ['hosts'],
        queryFn: fetchHosts
    });
};