import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

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
    latest_version_url?: string;
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
    return response.json();
};

// Fetch sub-remote counts for all remotes
const fetchRemoteSubRemoteCounts = async (): Promise<RemoteSubRemoteCount[]> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/sub-remote-counts`);
    return response.json();
};

const fetchRemotes = async () => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes`);
    return response.json();
};

const fetchRemote = async (id: number) => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/${id}`);
    return response.json();
};

const createRemote = async (remote: RemoteRequest) => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes`, {
        method: 'POST',
        body: JSON.stringify(remote),
    });
    return response.json();
};

const updateRemote = async ({ id, remote }: { id: number; remote: RemoteRequest }) => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(remote),
    });
    return response.json();
};

const deleteRemote = async (id: number) => {
    await fetchWithAuth(`${config.backendUrl}/api/remotes/${id}`, {
        method: 'DELETE',
    });
};

const updateRemoteUrl = async ({ id, version }: { id: number; version: string }) => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/${id}/url`, {
        method: 'PUT',
        body: JSON.stringify({ version }),
    });
    return response.json();
};

const fetchRemoteVersions = async (remoteId: number) => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/${remoteId}/versions`);
    return response.json();
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
