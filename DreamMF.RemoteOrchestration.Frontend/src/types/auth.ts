export enum AuthProvider {
    Local = 'local',
    Google = 'google',
    GitHub = 'github',
    Microsoft = 'microsoft'
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    roles: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName: string;
    authProvider: AuthProvider;
}

export interface PasswordResetRequest {
    token: string;
    newPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}
