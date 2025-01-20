/**
 * Constructs an API URL by combining the backend URL with the provided path
 * @param path - The API path (should start with /)
 * @returns The complete API URL
 */
export const getApiUrl = (path: string): string => {
    console.log('###', window.DreamMF);
    const backendUrl = window.DreamMF?.config?.BACKEND_URL || 'https://localhost:5001';
    return `${backendUrl}${path}`;
};

interface DreamConfig {
    BACKEND_URL: string;
    AUTH_AUTHORITY: string;
    AUTH_CLIENT_ID: string;
}

const DEFAULT_CONFIG: DreamConfig = {
    BACKEND_URL: 'https://localhost:5001',
    AUTH_AUTHORITY: 'http://localhost:5000',
    AUTH_CLIENT_ID: 'DreamMF.Web'
};

declare global {
    interface Window {
        DreamMF: {
            config: DreamConfig;
        };
    }
}

export async function loadDreamConfig(): Promise<DreamConfig> {
    console.log('Loading DreamMF environment configuration...');
    window.DreamMF = window.DreamMF || {};
    
    try {
        const response = await fetch('./env-config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config: DreamConfig = await response.json();
        window.DreamMF.config = config;
        console.log('DreamMF environment configuration loaded successfully');
        return config;
    } catch (error) {
        console.error('Failed to load DreamMF environment configuration:', error);
        window.DreamMF.config = DEFAULT_CONFIG;
        return DEFAULT_CONFIG;
    }
}
