import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';

interface Tag {
    tag_ID: number;
    text: string;
    created_Date: string;
    updated_Date: string;
}

interface TagRequest {
    text: string;
}

export const useTags = () => {
    return useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/tags`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
    });
};

export const useTag = (id: number) => {
    return useQuery<Tag>({
        queryKey: ['tags', id],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/tags/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!id
    });
};

export const useCreateTag = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (tag: TagRequest) => {
            const response = await fetch(`${config.backendUrl}/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tag),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ id, tag }: { id: number; tag: TagRequest }) => {
            const response = await fetch(`${config.backendUrl}/tags/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tag),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useDeleteTag = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`${config.backendUrl}/tags/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useTagsByHost = (hostId: number) => {
    return useQuery<Tag[]>({
        queryKey: ['tags', 'host', hostId],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/tags/host/${hostId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!hostId
    });
};

export const useAddTagToHost = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ hostId, tagId }: { hostId: number; tagId: number }) => {
            const response = await fetch(`${config.backendUrl}/tags/host/${hostId}/add/${tagId}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tags', 'host', variables.hostId] });
        },
    });
};

export const useRemoveTagFromHost = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ hostId, tagId }: { hostId: number; tagId: number }) => {
            const response = await fetch(`${config.backendUrl}/tags/host/${hostId}/remove/${tagId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tags', 'host', variables.hostId] });
        },
    });
};
