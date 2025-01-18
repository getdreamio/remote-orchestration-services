import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/env';

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

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/api/users`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
    });
};

export const useUser = (id: number) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/api/users/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!id
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (user: CreateUserRequest) => {
            const response = await fetch(`${config.backendUrl}/api/users`, {
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
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, user }: { id: number; user: UpdateUserRequest }) => {
            const response = await fetch(`${config.backendUrl}/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`${config.backendUrl}/api/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUserRoles = (userId: number) => {
    return useQuery({
        queryKey: ['user-roles', userId],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/api/users/${userId}/roles`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!userId
    });
};

export const useAddUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, roleName }: { userId: number; roleName: string }) => {
            const response = await fetch(`${config.backendUrl}/api/users/${userId}/roles/${roleName}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
        },
    });
};

export const useRemoveUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, roleName }: { userId: number; roleName: string }) => {
            const response = await fetch(`${config.backendUrl}/api/users/${userId}/roles/${roleName}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
        },
    });
};
