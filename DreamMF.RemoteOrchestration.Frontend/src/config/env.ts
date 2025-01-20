declare global {
    interface Window {
        DreamMF: {
            config: {
                BACKEND_URL: string;
                AUTH_AUTHORITY: string;
                AUTH_CLIENT_ID: string;
            };
        };
    }
}

export const config = {
    backendUrl: window.DreamMF?.config?.BACKEND_URL || 'https://localhost:5001',
    authAuthority: window.DreamMF?.config?.AUTH_AUTHORITY || 'http://localhost:5000',
    authClientId: window.DreamMF?.config?.AUTH_CLIENT_ID || 'DreamMF.Web',
} as const;

// Type-safe way to access environment variables
export type Config = typeof config;
