import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';

interface Host {
    id: number;
    name: string;
    description: string;
    url: string;
    key: string;
    environment: string;
    created_Date: string;
    updated_Date: string;
}

interface HostRequest {
    name: string;
    description: string;
    url: string;
    environment: string;
}

const fetchHosts = async (): Promise<Host[]> => {
    const response = await fetch(`${config.backendUrl}/hosts`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchHost = async (id: number): Promise<Host> => {
    const response = await fetch(`${config.backendUrl}/hosts/${id}`);
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
            const response = await fetch(`${config.backendUrl}/hosts`, {
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
            const response = await fetch(`${config.backendUrl}/hosts/${id}`, {
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
            const response = await fetch(`${config.backendUrl}/hosts/${id}`, {
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