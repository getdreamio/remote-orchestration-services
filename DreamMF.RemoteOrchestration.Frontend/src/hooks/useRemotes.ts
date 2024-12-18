import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';

interface Remote {
    id: number;
    name: string;
    storageType: string;
    configuration: string;
    created_Date: string;
    updated_Date: string;
}

interface RemoteRequest {
    name: string;
    storageType: string;
    configuration: string;
}

export const useRemotes = () => {
    return useQuery<Remote[]>({
        queryKey: ['remotes'],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/remotes`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
    });
};

export const useRemote = (id: number) => {
    return useQuery<Remote>({
        queryKey: ['remotes', id],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/remotes/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!id
    });
};

export const useCreateRemote = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (remote: RemoteRequest) => {
            const response = await fetch(`${config.backendUrl}/remotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(remote),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};

export const useUpdateRemote = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, remote }: { id: number; remote: RemoteRequest }) => {
            const response = await fetch(`${config.backendUrl}/remotes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(remote),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};

export const useDeleteRemote = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`${config.backendUrl}/remotes/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remotes'] });
        },
    });
};
