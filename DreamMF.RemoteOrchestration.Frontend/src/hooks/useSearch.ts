import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../utils/api';
import { Host } from './useHosts';
import { Remote } from './useRemotes';
import { message } from 'antd';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export interface SearchResponse {
    hosts: Host[];
    remotes: Remote[];
}

const fetchSearchResults = async (searchText: string) => {
    const response = await fetchWithAuth(getApiUrl(`/api/search?q=${encodeURIComponent(searchText)}`));
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export const useSearch = (searchText: string) => {
    return useQuery({
        queryKey: ['search', searchText],
        queryFn: () => fetchSearchResults(searchText),
        enabled: !!searchText,
    });
};
