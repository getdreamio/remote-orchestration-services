import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

interface Host {
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

interface HostRemoteCount {
    hostId: number;
    count: number;
}

interface RemoteHostCount {
    remoteId: number;
    count: number;
}

export type HostRequest = Omit<Host, 'id' | 'createdAt' | 'updatedAt'>;

const fetchHosts = async (): Promise<Host[]> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/hosts`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchHost = async (id: number): Promise<Host> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/hosts/${id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

// Fetch remotes attached to a host
const fetchHostRemotes = async (hostId: number): Promise<HostRemote[]> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/hosts/${hostId}/remotes`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

// Attach a remote to a host
const attachRemoteToHost = async ({ hostId, remoteId }: { hostId: number; remoteId: number }): Promise<void> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/hosts/${hostId}/attach`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remoteId }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};

// Detach a remote from a host
const detachRemoteFromHost = async ({ hostId, remoteId }: { hostId: number; remoteId: number }): Promise<void> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/hosts/${hostId}/detach`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remoteId }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};

// Fetch remote counts for all hosts
const fetchHostRemoteCounts = async (): Promise<HostRemoteCount[]> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/hosts/remote-counts`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

// Fetch host counts for all remotes
const fetchRemoteHostCounts = async (): Promise<RemoteHostCount[]> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/remotes/host-counts`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
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
        mutationFn: async (host: HostRequest) => {
            const response = await fetchWithAuth(`${config.backendUrl}/api/hosts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(host),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
        },
    });
};

export const useUpdateHost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, host }: { id: number; host: HostRequest }) => {
            const response = await fetchWithAuth(`${config.backendUrl}/api/hosts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(host),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
        },
    });
};

export const useDeleteHost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetchWithAuth(`${config.backendUrl}/api/hosts/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
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

export const useHostRemoteCounts = () => {
    return useQuery({
        queryKey: ['hosts', 'remote-counts'],
        queryFn: fetchHostRemoteCounts,
    });
};

export const useRemoteHostCounts = () => {
    return useQuery({
        queryKey: ['remotes', 'host-counts'],
        queryFn: fetchRemoteHostCounts,
    });
};