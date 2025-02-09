import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getApiUrl } from '../utils/api';

export interface Configuration {
    id: number;
    key: string;
    value: string;
}

export interface ConfigurationRequest {
    key: string;
    value: string;
}

export type StorageType = 'LocalStorage' | 'AzureBlobStorage' | 'AwsS3Bucket';
export type DatabaseType = 'sqlite' | 'sqlserver' | 'postgres';

const fetchConfigurations = async (): Promise<Configuration[]> => {
    const response = await fetchWithAuth(getApiUrl('/api/configurations'));
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const updateConfiguration = async ({ id, data }: { id: number; data: ConfigurationRequest }): Promise<Configuration> => {
    const response = await fetchWithAuth(getApiUrl(`/api/configurations/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const createConfiguration = async (data: ConfigurationRequest): Promise<Configuration> => {
    const response = await fetchWithAuth(getApiUrl('/api/configurations'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const updateConfigurationBatch = async (data: ConfigurationRequest[]): Promise<Configuration[]> => {
    const response = await fetchWithAuth(getApiUrl('/api/configurations/batch'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export function useConfigurations() {
    return useQuery<Configuration[]>({
        queryKey: ['configurations'],
        queryFn: fetchConfigurations,
    });
}

export function useUpdateConfiguration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateConfiguration,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configurations'] });
        },
    });
}

export function useCreateConfiguration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createConfiguration,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configurations'] });
        },
    });
}

export const useUpdateConfigurationBatch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateConfigurationBatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configurations'] });
        },
    });
};
