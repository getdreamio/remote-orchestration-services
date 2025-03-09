import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getApiUrl } from '../utils/api';
import { ApiError } from '@/utils/errors';

interface Remote {
    id: number;
    name: string;
    key: string;
    scope: string;
    repository: string;
    contact_name: string;
    contact_email: string;
    documentation_url: string;
    created_Date: string;
    updated_Date: string;
    modules?: RemoteModule[];
    latest_version?: string;
    url?: string;
}

export interface Version {
    version_ID: number;
    remote_ID: number;
    value: string;
    created_Date: string;
    updated_Date: string;
}

export interface RemoteModule {
    id?: number;
    name: string;
    created_Date?: string;
    updated_Date?: string;
}

interface RemoteRequest {
    name: string;
    key: string;
    scope: string;
    repository: string;
    contact_name: string;
    contact_email: string;
    documentation_url: string;
    modules?: RemoteModule[];
}

interface RemoteModuleCount {
    remoteId: number;
    count: number;
}

interface RemoteSubRemoteCount {
    remoteId: number;
    count: number;
}

// Fetch module counts for all remotes
const fetchRemoteModuleCounts = async (): Promise<RemoteModuleCount[]> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/module-counts`);
    const data = await response.json();
    return data;
};

// Fetch sub-remote counts for all remotes
const fetchRemoteSubRemoteCounts = async (): Promise<RemoteSubRemoteCount[]> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/sub-remote-counts`);
    const data = await response.json();
    return data;
};

const fetchRemotes = async () => {
    const response = await fetchWithAuth(getApiUrl('/api/remotes'));
    const data = await response.json();
    return data;
};

const fetchRemote = async (id: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/remotes/${id}`));
    const data = await response.json();
    return data;
};

export const fetchModules = async (moduleInput: string) => {
    const url = getApiUrl(`/api/remotes/modules?contains=${moduleInput}`);
    const response = await fetchWithAuth(url);
    const data = await response.json();
    return data.map((module: RemoteModule) => ({ value: module.name }));
};

const createRemote = async (remote: RemoteRequest) => {
    const response = await fetchWithAuth(getApiUrl('/api/remotes'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(remote),
    });
    const data = await response.json();
    return data;
};

const updateRemote = async ({ id, remote }: { id: number; remote: RemoteRequest }) => {
    const response = await fetchWithAuth(getApiUrl(`/api/remotes/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(remote),
    });
    const data = await response.json();
    return data;
};

const deleteRemote = async (id: number) => {
    await fetchWithAuth(getApiUrl(`/api/remotes/${id}`), {
        method: 'DELETE',
    });
};

const updateRemoteUrl = async ({ id, version }: { id: number; version: string }) => {
    const response = await fetchWithAuth(getApiUrl(`/api/remotes/${id}/url`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
    });
    const data = await response.json();
    return data;
};

const setCurrentVersion = async ({ id, version }: { id: number; version: string }) => {
    try {
        console.log('Setting current version:', { id, version });
        
        const response = await fetchWithAuth(getApiUrl(`/api/remotes/${id}/set-current-version`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ version }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Setting current version failed:', response.status, errorText);
            throw new ApiError(`Setting current version failed: ${response.status} ${errorText}`, response.status);
        }
        
        const data = await response.json();
        console.log('Current version set successfully');
        return data;
    } catch (error) {
        console.error('Error in setCurrentVersion:', error);
        throw error;
    }
};

const fetchRemoteVersions = async (remoteId: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/remotes/${remoteId}/versions`));
    const data = await response.json();
    return data;
};

interface UploadRemoteVersionParams {
    name: string;
    version: string;
    key: string;
    scope: string;
    file: File;
}

const uploadRemoteVersion = async ({ name, version, key, scope, file }: UploadRemoteVersionParams) => {
    try {
        console.log('Starting file upload for:', { name, version, key, scope, fileName: file.name, fileSize: file.size });
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Log all entries in the FormData to verify the file is being added correctly
        for (const pair of formData.entries()) {
            console.log('FormData entry:', pair[0], pair[1]);
        }
        
        const url = getApiUrl(`/api/upload/remote/${encodeURIComponent(name)}/${encodeURIComponent(version)}/${encodeURIComponent(key)}/${encodeURIComponent(scope)}`);
        console.log('Upload URL:', url);
        
        // Use fetchWithAuth but explicitly set the headers to not include Content-Type
        const token = localStorage.getItem('auth_token');
        console.log('Auth token available:', !!token);
        
        // Create a fetch request with the right configuration for file uploads
        console.log('Sending fetch request...');
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
            credentials: 'include',
            mode: 'cors'
        });
        
        console.log('Response received:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', response.status, errorText);
            throw new ApiError(`Upload failed: ${response.status} ${errorText}`, response.status);
        }
        
        console.log('Upload completed successfully');
        return true;
    } catch (error) {
        console.error('Error in uploadRemoteVersion:', error);
        throw error;
    }
};

export const useRemotes = () => {
    return useQuery<Remote[]>({
        queryKey: ['remotes'],
        queryFn: fetchRemotes,
    });
};

export const useRemote = (id: number) => {
    return useQuery<Remote>({
        queryKey: ['remotes', id],
        queryFn: () => fetchRemote(id),
        enabled: !!id,
        throwOnError: true
    });
};

export const useCreateRemote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRemote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};

export const useUpdateRemote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateRemote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};

export const useUpdateRemoteUrl = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateRemoteUrl,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};

export const useDeleteRemote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteRemote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};

export const useRemoteModuleCounts = () => {
    return useQuery({
        queryKey: ['remotes', 'module-counts'],
        queryFn: fetchRemoteModuleCounts,
    });
};

export const useRemoteSubRemoteCounts = () => {
    return useQuery({
        queryKey: ['remotes', 'sub-remote-counts'],
        queryFn: fetchRemoteSubRemoteCounts,
    });
};

export const useRemoteVersions = (remoteId: number) => {
    return useQuery<Version[]>({
        queryKey: ['remotes', remoteId, 'versions'],
        queryFn: () => fetchRemoteVersions(remoteId),
        enabled: !!remoteId,
    });
};

export const useUploadRemoteVersion = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: uploadRemoteVersion,
        onSuccess: () => {
            // Invalidate all remotes and versions queries to refresh the lists
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};

export const useSetCurrentVersion = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: setCurrentVersion,
        onSuccess: () => {
            // Invalidate all remotes and versions queries to refresh the lists
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
            queryClient.invalidateQueries({ queryKey: ['remoteVersions'] });
        },
    });
};
