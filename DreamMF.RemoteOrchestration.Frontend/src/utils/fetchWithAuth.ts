import { ApiError } from './errors';

const TOKEN_KEY = 'auth_token';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

export const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    const { skipAuth = false, headers: initialHeaders = {}, ...rest } = options;
    
    const token = localStorage.getItem(TOKEN_KEY);
    
    let requestHeaders = { ...initialHeaders };
    
    // Check if we're sending FormData (file upload)
    const isFormData = options.body instanceof FormData;
    
    if (!skipAuth && token) {
        requestHeaders = {
            ...requestHeaders,
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - browser will set it with boundary
            ...(!isFormData && {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
    }

    const response = await fetch(url, {
        ...rest,
        headers: requestHeaders,
    });

    if (response.status === 401) {
        throw new ApiError('Unauthorized', 401);
    }

    if (response.status === 403) {
        throw new ApiError("You don't have permission to perform this action.", 403);
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            errorData?.message || 'Network response was not ok',
            response.status,
            errorData
        );
    }

    return response;
};
