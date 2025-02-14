import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getApiUrl } from '../utils/api';

export type AuthProvider = 'Local' | 'Google' | 'GitHub' | 'Microsoft' | 'Custom';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'PendingVerification';

export interface User {
    id: number;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    status: UserStatus;
    lastLoginDate?: string;
    createdDate: string;
    updatedDate: string;
    roles: string[];
}

export interface CreateUserRequest {
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    authProvider: AuthProvider;
    authUserId?: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface UpdateUserRequest {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    currentPassword?: string;
    newPassword?: string;
    isTwoFactorEnabled?: boolean;
    status?: UserStatus;
}

const fetchUsers = async () => {
    const response = await fetchWithAuth(getApiUrl('/api/users'));
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchUser = async (id: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/users/${id}`));
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const createUser = async (user: CreateUserRequest) => {
    const response = await fetchWithAuth(getApiUrl('/api/users'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const updateUser = async ({ id, user }: { id: number; user: UpdateUserRequest }) => {
    const response = await fetchWithAuth(getApiUrl(`/api/users/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const deleteUser = async (id: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/users/${id}`), {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};

const fetchUserRoles = async (userId: number) => {
    const response = await fetchWithAuth(getApiUrl(`/api/users/${userId}/roles`));
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const fetchAllRoles = async () => {
    const response = await fetchWithAuth(getApiUrl('/api/users/roles'));
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const addUserRole = async ({ userId, roleName }: { userId: number; roleName: string }) => {
    const response = await fetchWithAuth(getApiUrl(`/api/users/${userId}/roles`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleName }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};

const removeUserRole = async ({ userId, roleName }: { userId: number; roleName: string }) => {
    const response = await fetchWithAuth(getApiUrl(`/api/users/${userId}/roles/${roleName}`), {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
};

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });
};

export const useUser = (id: number) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUser(id),
        enabled: !!id
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUser,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUserRoles = (userId: number) => {
    return useQuery({
        queryKey: ['user-roles', userId],
        queryFn: () => fetchUserRoles(userId),
        enabled: !!userId
    });
};

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: () => fetchAllRoles()
    });
};

export const useAddUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addUserRole,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
        },
    });
};

export const useRemoveUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeUserRole,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
        },
    });
};
