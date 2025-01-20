import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';
import { Host } from './useHosts';
import { Remote } from './useRemotes';
import { message } from 'antd';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export interface SearchResponse {
    hosts: Host[];
    remotes: Remote[];
}

const fetchSearchResults = async (searchText: string) => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/search`, {
        method: 'POST',
        body: JSON.stringify({ searchText })
    });
    return response.json();
};

export const useSearch = (searchText: string) => {
    return useQuery({
        queryKey: ['search', searchText],
        queryFn: () => fetchSearchResults(searchText),
        enabled: !!searchText,
    });
};
