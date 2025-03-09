import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getApiUrl } from '../utils/api';

export interface Host {
    id: number;
    name: string;
    description: string;
    url: string;
    key: string;
    environment: string;
    repository?: string;
    contactName?: string;
    contactEmail?: string;
    documentationUrl?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface HostRemote {
    id: number;
    hostId: number;
    remoteId: number;
    createdAt: string;
}

export type HostRequest = Omit<Host, 'id' | 'createdAt' | 'updatedAt'>;

const fetchHosts = async (): Promise<Host[]> => {
    const response = await fetchWithAuth(getApiUrl('/api/hosts'));
    const data = await response.json();
    return data;
};

const fetchHost = async (id: number): Promise<Host> => {
    const response = await fetchWithAuth(getApiUrl(`/api/hosts/${id}`));
    const data = await response.json();
    return data;
};

// Fetch remotes attached to a host
const fetchHostRemotes = async (hostId: number): Promise<HostRemote[]> => {
    const response = await fetchWithAuth(getApiUrl(`/api/hosts/${hostId}/remotes`));
    const data = await response.json();
    return data;
};

// Attach a remote to a host
const attachRemoteToHost = async ({ hostId, remoteId }: { hostId: number; remoteId: number }): Promise<void> => {
    const response = await fetchWithAuth(getApiUrl(`/api/hosts/${hostId}/attach`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remoteId }),
    });
    const data = await response.json();
    return data;
};

// Detach a remote from a host
const detachRemoteFromHost = async ({ hostId, remoteId }: { hostId: number; remoteId: number }): Promise<void> => {
    const response = await fetchWithAuth(getApiUrl(`/api/hosts/${hostId}/detach`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remoteId }),
    });
    const data = await response.json();
    return data;
};

// Create a new host
const createHost = async (data: HostRequest): Promise<Host> => {
    const response = await fetchWithAuth(getApiUrl('/api/hosts'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
};

// Update an existing host
const updateHost = async ({ id, data }: { id: number; data: Partial<HostRequest> }): Promise<Host> => {
    const response = await fetchWithAuth(getApiUrl(`/api/hosts/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
};

// Delete a host
const deleteHost = async (id: number): Promise<void> => {
    await fetchWithAuth(getApiUrl(`/api/hosts/${id}`), {
        method: 'DELETE',
    });
};

export const useHosts = () => {
    return useQuery({
        queryKey: ['hosts'],
        queryFn: fetchHosts
    });
};

export const useGetHost = (id: number) => {
    return useQuery({
        queryKey: ['hosts', id],
        queryFn: () => fetchHost(id),
        enabled: !!id
    });
};

export const useCreateHost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createHost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
        },
    });
};

export const useUpdateHost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateHost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
        },
    });
};

export const useDeleteHost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteHost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
        },
    });
};

export const useHostRemotes = (hostId: number) => {
    return useQuery({
        queryKey: ['hosts', hostId, 'remotes'],
        queryFn: () => fetchHostRemotes(hostId),
        enabled: !!hostId,
    });
};

export const useAttachRemote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: attachRemoteToHost,
        onSuccess: (_, { hostId }) => {
            queryClient.invalidateQueries({ queryKey: ['hosts', hostId, 'remotes'] });
        },
    });
};

export const useDetachRemote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: detachRemoteFromHost,
        onSuccess: (_, { hostId }) => {
            queryClient.invalidateQueries({ queryKey: ['hosts', hostId, 'remotes'] });
        },
    });
};