export const config = {
    backendUrl: process.env.BACKEND_URL || 'https://localhost:5001'
} as const;

// Type-safe way to access environment variables
export type Config = typeof config;
