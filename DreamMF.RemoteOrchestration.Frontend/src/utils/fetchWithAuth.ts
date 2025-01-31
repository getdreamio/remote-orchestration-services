const TOKEN_KEY = 'auth_token';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

export const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    const { skipAuth = false, headers: initialHeaders = {}, ...rest } = options;
    
    const token = localStorage.getItem(TOKEN_KEY);
    
    let requestHeaders = { ...initialHeaders };
    
    if (!skipAuth && token) {
        requestHeaders = {
            ...requestHeaders,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    const response = await fetch(url, {
        ...rest,
        //body: rest.body ? JSON.stringify(rest.body) : undefined,
        headers: requestHeaders,
    });

    if (response.status === 401) {
        // Optional: Handle token expiration
        // window.location.href = '/auth/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response;
};
