export const config = {
    backendUrl: process.env.BACKEND_URL || 'https://localhost:5001',
    authAuthority: process.env.AUTH_AUTHORITY || 'http://localhost:5000',
    authClientId: process.env.AUTH_CLIENT_ID || 'DreamMF.Web',
} as const;

// Type-safe way to access environment variables
export type Config = typeof config;
