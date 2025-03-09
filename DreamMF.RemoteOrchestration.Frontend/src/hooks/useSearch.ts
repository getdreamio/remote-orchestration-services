import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../utils/api';
import { Host } from './useHosts';
import { Remote } from './useRemotes';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

export interface Tag {
    key: string;
    value?: string;
}

export interface SearchRequest {
    searchText: string;
    tagValues?: string[];
}

export interface SearchResponse {
    hosts: (Host & { tags?: Tag[] })[];
    remotes: (Remote & { tags?: Tag[] })[];
}

const fetchSearchResults = async (searchText?: string, tagValues?: string[]) => {
    // Allow searching by tags only, without search text
    const response = await fetchWithAuth(getApiUrl('/api/search'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            searchText: searchText || '',
            tagValues: tagValues?.length ? tagValues : undefined
        })
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export const useSearch = (searchText?: string, tagValues?: string[]) => {
    return useQuery({
        queryKey: ['search', searchText, tagValues],
        queryFn: () => fetchSearchResults(searchText, tagValues),
        enabled: (!!searchText && searchText.trim() !== '') || (tagValues && tagValues.length > 0),
    });
};
