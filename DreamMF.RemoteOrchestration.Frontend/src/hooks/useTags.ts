import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notify from '../utils/notifications';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getApiUrl } from '../utils/api';

export interface Tag {
    tag_ID: number;
    key: string;
    created_Date: Date;
    updated_Date: Date;
}

export interface TagRequest {
    key: string;
    display_Name?: string;
}

export interface TagAssociation {
    id: number;
    name: string;
    type: 'host' | 'remote';
}

export interface TagEntityResponse {
    id: number;
    tag_ID: number;
    key: string;
    display_Name?: string;
    value: string;
}

const fetchTags = async () => {
    const response = await fetchWithAuth(getApiUrl('/api/tags'));
    const data = await response.json();
    return data;
};

const fetchTag = async (id: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/tags/${id}`));
    const data = await response.json();
    return data;
};

const fetchTagRemotes = async (id: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/tags/${id}/remotes`));
    const data = await response.json();
    return data;
};

const fetchTagHosts = async (id: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/tags/${id}/hosts`));
    const data = await response.json();
    return data;
};

const createTag = async (tag: TagRequest) => {
    const payload = {
        key: tag.key,
        display_Name: tag.display_Name || tag.key
    };
    const response = await fetchWithAuth(getApiUrl('/api/tags'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
};

const updateTag = async ({ id, tag }: { id: number; tag: Partial<Tag> }) => {
    const response = await fetchWithAuth(getApiUrl(`/api/tags/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tag),
    });
    const data = await response.json();
    return data;
};

const deleteTag = async (id: number) => {
    await fetchWithAuth(getApiUrl(`/api/tags/${id}`), {
        method: 'DELETE',
    });
};

const removeTagAssociation = async ({ tagId, itemId, type }: { tagId: number; itemId: number; type: 'host' | 'remote' }) => {
    const endpoint = type === 'host'
        ? getApiUrl(`/api/tags/host/${itemId}/remove/${tagId}`)
        : getApiUrl(`/api/tags/remote/${itemId}/remove/${tagId}`);

    await fetchWithAuth(endpoint, {
        method: 'DELETE',
    });
};

const fetchTagsByHost = async (hostId: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/tags/host/${hostId}`));
    const data = await response.json();
    return data;
};

const fetchTagsByRemote = async (remoteId: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/tags/remote/${remoteId}`));
    const data = await response.json();
    return data;
};

const addTagToEntity = async ({ entityType, entityId, tagId, value }: { entityType: 'host' | 'remote', entityId: number, tagId: number, value: string }) => {
    const response = await fetchWithAuth(getApiUrl('/api/tags/add-to-entity'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            value,
            entityType,
            entityId,
            tagId 
        })
    });
    const data = await response.json();
    return data;
};

const addTagToHost = async ({ hostId, tagId, value }: { hostId: number; tagId: number; value: string }) => {
    const response = await fetchWithAuth(getApiUrl(`/api/tags/host/${hostId}/add/${tagId}`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            value,
            entityType: 'host',
            entityId: hostId,
            tagId 
        })
    });
    const data = await response.json();
    return data;
};

const removeTagFromHost = async ({ hostId, tagId }: { hostId: number; tagId: number }) => {
    await fetchWithAuth(getApiUrl(`/api/tags/host/${hostId}/remove/${tagId}`), {
        method: 'DELETE',
    });
};

export const useTags = () => {
    return useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: fetchTags
    });
};

export const useTag = (id: number) => {
    return useQuery<Tag>({
        queryKey: ['tags', id],
        queryFn: () => fetchTag(id),
        enabled: !!id
    });
};

export const useTagRemotes = (id: number) => {
    return useQuery<TagAssociation[]>({
        queryKey: ['tag-remotes', id],
        queryFn: () => fetchTagRemotes(id),
        enabled: !!id
    });
};

export const useTagHosts = (id: number) => {
    return useQuery<TagAssociation[]>({
        queryKey: ['tag-hosts', id],
        queryFn: () => fetchTagHosts(id),
        enabled: !!id
    });
};

export const useCreateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            notify.success('Tag created successfully');
        },
        onError: () => {
            notify.error('Error', 'Failed to create tag');
        },
    });
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            notify.success('Tag updated successfully');
        },
        onError: () => {
            notify.error('Error', 'Failed to update tag');
        },
    });
};

export const useDeleteTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useRemoveTagAssociation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeTagAssociation,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tags', variables.type, variables.itemId] });
            notify.success(`Tag removed from ${variables.type} successfully`);
        },
        onError: (_, variables) => {
            notify.error('Error', `Failed to remove tag from ${variables.type}`);
        },
    });
};

export const useTagsByHost = (hostId: number) => {
    return useQuery<Tag[]>({
        queryKey: ['tags', 'host', hostId],
        queryFn: () => fetchTagsByHost(hostId),
        enabled: !!hostId
    });
};

export const useTagsByRemote = (remoteId: number) => {
    return useQuery<Tag[]>({
        queryKey: ['tags', 'remote', remoteId],
        queryFn: () => fetchTagsByRemote(remoteId),
        enabled: !!remoteId
    });
};

export const useAddTagToEntity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addTagToEntity,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ['tags', variables.entityType, variables.entityId] 
            });
            notify.success('Tag added successfully');
        },
        onError: () => {
            notify.error('Error', 'Failed to add tag');
        },
    });
};

export const useAddTagToHost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addTagToHost,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tags', 'host', variables.hostId] });
        },
    });
};

export const useRemoveTagFromHost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeTagFromHost,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tags', 'host', variables.hostId] });
        },
    });
};