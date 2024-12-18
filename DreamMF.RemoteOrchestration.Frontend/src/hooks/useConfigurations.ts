import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';

export interface Configuration {
    id: number;
    key: string;
    value: string;
}

// Storage Configuration Keys
export const STORAGE_TYPE_KEY = 'StorageType';
export const LOCAL_STORAGE_PATH_KEY = 'LocalStoragePath';
export const AZURE_STORAGE_ACCOUNT_KEY = 'AzureStorageAccount';
export const AZURE_STORAGE_KEY_KEY = 'AzureStorageKey';
export const AZURE_CONTAINER_NAME_KEY = 'AzureBlobStorageContainerName';
export const AZURE_BLOB_NAME_KEY = 'AzureBlobStorageBlobName';
export const AWS_ACCESS_KEY_ID_KEY = 'AwsAccessKeyId';
export const AWS_SECRET_ACCESS_KEY_KEY = 'AwsSecretAccessKey';
export const AWS_REGION_KEY = 'AwsRegion';
export const AWS_BUCKET_NAME_KEY = 'AwsS3BucketName';
export const AWS_BUCKET_KEY_KEY = 'AwsS3BucketKey';

// Database Configuration Keys
export const DATABASE_TYPE_KEY = 'DatabaseType';
export const DATABASE_CONNECTION_KEY = 'DatabaseConnection';
export const DATABASE_NAME_KEY = 'DatabaseName';
export const DATABASE_USER_KEY = 'DatabaseUser';
export const DATABASE_PASSWORD_KEY = 'DatabasePassword';
export const DATABASE_HOST_KEY = 'DatabaseHost';
export const DATABASE_PORT_KEY = 'DatabasePort';

export type StorageType = 'LocalStorage' | 'AzureBlobStorage' | 'AwsS3Bucket';
export type DatabaseType = 'sqlite' | 'sqlserver' | 'postgres';

const fetchConfigurations = async (): Promise<Configuration[]> => {
    const response = await fetch(`${config.backendUrl}/api/configurations`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const updateConfiguration = async ({ id, key, value }: { id: number; key: string; value: string }): Promise<Configuration> => {
    const response = await fetch(`${config.backendUrl}/api/configurations/${id}`, {
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
    const response = await fetch(`${config.backendUrl}/api/configurations`, {
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
