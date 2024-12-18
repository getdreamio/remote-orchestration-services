import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';
import { message } from 'antd';

export interface Tag {
    id: number;
    key: string;
    created_Date: string;
    updated_Date: string;
}
export interface TagRequest {
    key: string;
}

export interface TagAssociation {
    id: number;
    name: string;
    type: 'host' | 'remote';
}

export const useTags = () => {
    return useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/api/tags`);
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
            const response = await fetch(`${config.backendUrl}/api/tags/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!id
    });
};

export const useTagAssociations = (id: number) => {
    return useQuery<TagAssociation[]>({
        queryKey: ['tag-associations', id],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/api/tags/${id}/associations`);
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
            const response = await fetch(`${config.backendUrl}/api/tags`, {
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
        mutationFn: async ({ id, tag }: { id: number; tag: Partial<TagRequest> }) => {
            const response = await fetch(`${config.backendUrl}/api/tags/${id}`, {
                method: 'PUT',
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
            message.success('Tag updated successfully');
        },
        onError: () => {
            message.error('Failed to update tag');
        },
    });
};

export const useDeleteTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`${config.backendUrl}/api/tags/${id}`, {
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

export const useRemoveTagAssociation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tagId, itemId, type }: { tagId: number; itemId: number; type: 'host' | 'remote' }) => {
            const response = await fetch(`${config.backendUrl}/api/tags/${tagId}/associations/${type}/${itemId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Failed to remove tag from ${type}`);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tag-associations', variables.tagId] });
            message.success(`Tag removed from ${variables.type} successfully`);
        },
        onError: (_, variables) => {
            message.error(`Failed to remove tag from ${variables.type}`);
        },
    });
};

export const useTagsByHost = (hostId: number) => {
    return useQuery<Tag[]>({
        queryKey: ['tags', 'host', hostId],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/api/tags/host/${hostId}`);
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
            const response = await fetch(`${config.backendUrl}/api/tags/host/${hostId}/add/${tagId}`, {
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
            const response = await fetch(`${config.backendUrl}/api/tags/host/${hostId}/remove/${tagId}`, {
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