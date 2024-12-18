import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';

export interface Configuration {
    id: number;
    key: string;
    value: string;
}

export const STORAGE_TYPE_KEY = 'StorageType';
export const AZURE_CONTAINER_NAME_KEY = 'AzureBlobStorageContainerName';
export const AZURE_BLOB_NAME_KEY = 'AzureBlobStorageBlobName';
export const AWS_BUCKET_NAME_KEY = 'AwsS3BucketName';
export const AWS_BUCKET_KEY_KEY = 'AwsS3BucketKey';

export type StorageType = 'AzureBlobStorage' | 'AwsS3Bucket';

const fetchConfigurations = async (): Promise<Configuration[]> => {
    const response = await fetch(`${config.backendUrl}/configurations`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const updateConfiguration = async ({ id, key, value }: { id: number; key: string; value: string }): Promise<Configuration> => {
    const response = await fetch(`${config.backendUrl}/configurations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const createConfiguration = async ({ key, value }: { key: string; value: string }): Promise<Configuration> => {
    const response = await fetch(`${config.backendUrl}/configurations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
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
