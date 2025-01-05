import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';
import { Host } from './useHosts';
import { Remote } from './useRemotes';
import { message } from 'antd';

export interface SearchResponse {
    hosts: Host[];
    remotes: Remote[];
}

export const useSearch = (searchText: string) => {
    return useQuery({
        queryKey: ['search', searchText],
        queryFn: async () => {
            if (!searchText) return { hosts: [], remotes: [] };

            const response = await fetch(`${config.backendUrl}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchText }),
            });

            if (!response.ok) {
                message.error('Failed to perform search');
                throw new Error('Failed to perform search');
            }

            return response.json();
        },
        enabled: !!searchText,
    });
};
